import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

function isMissingProfilesTableError(message?: string) {
  if (!message) return false

  const normalized = message.toLowerCase()
  return (
    normalized.includes("could not find the table 'public.profiles' in the schema cache") ||
    normalized.includes('relation "profiles" does not exist') ||
    normalized.includes('relation "public.profiles" does not exist')
  )
}

function metadataToProfile(user: { id: string; user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata ?? {}
  const role = metadata.role === "student" || metadata.role === "recruiter" ? metadata.role : null
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : null

  return {
    id: user.id,
    role,
    full_name: fullName,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error } = await auth.supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", auth.user.id)
    .maybeSingle()

  if (error) {
    if (isMissingProfilesTableError(error.message)) {
      return NextResponse.json({
        profile: metadataToProfile(auth.user),
        user: { id: auth.user.id, email: auth.user.email },
        degraded: true,
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const resolvedProfile = profile ?? metadataToProfile(auth.user)

  return NextResponse.json({
    profile: resolvedProfile,
    user: { id: auth.user.id, email: auth.user.email },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const role = body?.role === "recruiter" ? "recruiter" : "student"
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : null

  const { data, error } = await auth.supabase
    .from("profiles")
    .upsert(
      {
        id: auth.user.id,
        role,
        full_name: fullName,
      },
      { onConflict: "id" }
    )
    .select("id, full_name, role")
    .single()

  if (error) {
    if (isMissingProfilesTableError(error.message)) {
      return NextResponse.json({
        profile: {
          id: auth.user.id,
          role,
          full_name: fullName,
        },
        degraded: true,
        syncMetadataOnClient: true,
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
