import { NextRequest } from "next/server"
import { createSupabaseForAccessToken } from "@/lib/supabase/server"

function isMissingProfilesTableError(message?: string) {
  if (!message) return false

  const normalized = message.toLowerCase()
  return (
    normalized.includes("could not find the table 'public.profiles' in the schema cache") ||
    normalized.includes('relation "profiles" does not exist') ||
    normalized.includes('relation "public.profiles" does not exist')
  )
}

function getRoleFromMetadata(user: { user_metadata?: Record<string, unknown> }) {
  const metadataRole = user.user_metadata?.role
  if (metadataRole === "student" || metadataRole === "recruiter") {
    return metadataRole
  }

  return null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".")
  if (parts.length < 2) return null

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    return payload && typeof payload === "object" ? payload : null
  } catch {
    return null
  }
}

function isTokenIssuerMismatch(accessToken: string) {
  const payload = decodeJwtPayload(accessToken)
  const iss = typeof payload?.iss === "string" ? payload.iss : null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!iss || !supabaseUrl) return false

  try {
    const issuerHost = new URL(iss).host
    const configuredHost = new URL(supabaseUrl).host
    return issuerHost !== configuredHost
  } catch {
    return false
  }
}

export async function requireAuth(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null

  if (!accessToken) {
    return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), user: null, supabase: null }
  }

  if (isTokenIssuerMismatch(accessToken)) {
    return {
      error: new Response(
        JSON.stringify({ error: "Session belongs to a different Supabase project. Please sign out and sign in again." }),
        { status: 401 }
      ),
      user: null,
      supabase: null,
    }
  }

  let supabase

  try {
    supabase = createSupabaseForAccessToken(accessToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize Supabase client"
    return {
      error: new Response(JSON.stringify({ error: message }), { status: 500 }),
      user: null,
      supabase: null,
    }
  }

  const { data: authData, error: authError } = await supabase.auth.getUser().catch((error) => {
    const message = error instanceof Error ? error.message : "Unable to verify user session"
    return {
      data: { user: null },
      error: { message },
    }
  })

  if (authError || !authData.user) {
    return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), user: null, supabase: null }
  }

  return { error: null, user: authData.user, supabase }
}

export async function requireRole(request: NextRequest, role: "student" | "recruiter") {
  const auth = await requireAuth(request)
  if (auth.error || !auth.user || !auth.supabase) {
    return { ...auth, profile: null }
  }

  const roleFromMetadata = getRoleFromMetadata(auth.user)
  const metadataProfile = {
    id: auth.user.id,
    role,
    full_name: typeof auth.user.user_metadata?.full_name === "string" ? auth.user.user_metadata.full_name : null,
  }

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", auth.user.id)
    .single()

  if (profileError) {
    if (roleFromMetadata === role) {
      return {
        error: null,
        user: auth.user,
        supabase: auth.supabase,
        profile: metadataProfile,
      }
    }

    if (isMissingProfilesTableError(profileError.message)) {
      return {
        error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
        user: auth.user,
        supabase: auth.supabase,
        profile: null,
      }
    }

    return {
      error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
      user: auth.user,
      supabase: auth.supabase,
      profile: null,
    }
  }

  if (!profile || profile.role !== role) {
    if (roleFromMetadata === role) {
      return {
        error: null,
        user: auth.user,
        supabase: auth.supabase,
        profile: metadataProfile,
      }
    }

    return {
      error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
      user: auth.user,
      supabase: auth.supabase,
      profile: null,
    }
  }

  return { error: null, user: auth.user, supabase: auth.supabase, profile }
}
