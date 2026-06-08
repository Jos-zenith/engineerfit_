import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { finalizeSessionAndPersistAttempt } from "@/lib/assessment-session"

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
  }

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.userId !== auth.user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const responseHistory = JSON.parse(session.response_history || "[]")

  return finalizeSessionAndPersistAttempt(auth.user.id, {
    id: session.id,
    response_history: responseHistory,
    status: session.status,
  })
}
