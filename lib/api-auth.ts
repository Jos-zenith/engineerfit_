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

export async function requireAuth(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null

  if (!accessToken) {
    return { error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), user: null, supabase: null }
  }

  const supabase = createSupabaseForAccessToken(accessToken)
  const { data: authData, error: authError } = await supabase.auth.getUser()

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
