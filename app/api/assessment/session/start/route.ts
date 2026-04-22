import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { assessmentQuestionBank, toPublicQuestions } from "@/lib/assessment-bank"
import { selectMostInformativeQuestion } from "@/lib/irt"

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: existingSession } = await auth.supabase
    .from("assessment_sessions")
    .select("id, theta, asked_question_ids, response_history, status")
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const activeSession = existingSession ?? null

  if (activeSession) {
    const askedIds = Array.isArray(activeSession.asked_question_ids) ? activeSession.asked_question_ids : []
    const nextQuestion = selectMostInformativeQuestion(Number(activeSession.theta || 0), askedIds)

    if (!nextQuestion) {
      return NextResponse.json({
        sessionId: activeSession.id,
        completed: true,
      })
    }

    return NextResponse.json({
      sessionId: activeSession.id,
      theta: Number(activeSession.theta || 0),
      answeredCount: askedIds.length,
      totalQuestions: assessmentQuestionBank.length,
      question: toPublicQuestions([nextQuestion])[0],
    })
  }

  const initialTheta = 0
  const firstQuestion = selectMostInformativeQuestion(initialTheta, [])

  if (!firstQuestion) {
    return NextResponse.json({ error: "No assessment questions configured" }, { status: 500 })
  }

  const { data: createdSession, error: createError } = await auth.supabase
    .from("assessment_sessions")
    .insert({
      user_id: auth.user.id,
      theta: initialTheta,
      asked_question_ids: [],
      response_history: [],
      status: "active",
    })
    .select("id")
    .single()

  if (createError || !createdSession) {
    return NextResponse.json({ error: createError?.message ?? "Unable to create session" }, { status: 500 })
  }

  return NextResponse.json({
    sessionId: createdSession.id,
    theta: initialTheta,
    answeredCount: 0,
    totalQuestions: assessmentQuestionBank.length,
    question: toPublicQuestions([firstQuestion])[0],
  })
}
