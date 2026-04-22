import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { finalizeSessionAndPersistAttempt } from "@/lib/assessment-session"

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
  }

  const { data: session, error } = await auth.supabase
    .from("assessment_sessions")
    .select("id, response_history, status")
    .eq("id", sessionId)
    .eq("user_id", auth.user.id)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: error?.message ?? "Session not found" }, { status: 404 })
  }

  return finalizeSessionAndPersistAttempt(auth.supabase, auth.user.id, session)
}
