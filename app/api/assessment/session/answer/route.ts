import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { assessmentQuestionBank, getQuestionById, toPublicQuestions } from "@/lib/assessment-bank"
import { estimateTheta, itemInformation, probabilityCorrect, selectMostInformativeQuestion, type IrtResponseObservation } from "@/lib/irt"
import { finalizeSessionAndPersistAttempt } from "@/lib/assessment-session"

interface SessionResponse {
  questionId: number
  selectedIndex: number
  confidence: "low" | "medium" | "high"
  timeSpent: number
  correct: boolean
  thetaBefore: number
  thetaAfter: number
  expectedProbability: number
  informationValue: number
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""
  const questionId = Number(body?.questionId)
  const selectedIndex = Number(body?.selectedIndex)
  const confidence = body?.confidence === "low" || body?.confidence === "medium" || body?.confidence === "high" ? body.confidence : null
  const timeSpent = Number(body?.timeSpent)

  if (!sessionId || !Number.isFinite(questionId) || !Number.isFinite(selectedIndex) || !confidence || !Number.isFinite(timeSpent)) {
    return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 })
  }

  const { data: session, error: sessionError } = await auth.supabase
    .from("assessment_sessions")
    .select("id, user_id, theta, asked_question_ids, response_history, status")
    .eq("id", sessionId)
    .eq("user_id", auth.user.id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message ?? "Session not found" }, { status: 404 })
  }

  if (session.status !== "active") {
    return NextResponse.json({ error: "Session is already completed" }, { status: 400 })
  }

  const askedQuestionIds: number[] = Array.isArray(session.asked_question_ids) ? session.asked_question_ids : []
  if (askedQuestionIds.includes(questionId)) {
    return NextResponse.json({ error: "Question already answered" }, { status: 409 })
  }

  const question = getQuestionById(questionId)
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const thetaBefore = Number(session.theta || 0)
  const correct = selectedIndex === question.correctIndex

  const existingHistory: SessionResponse[] = Array.isArray(session.response_history)
    ? session.response_history
    : []

  const observations: IrtResponseObservation[] = [
    ...existingHistory.map((entry) => ({ questionId: entry.questionId, correct: entry.correct })),
    { questionId, correct },
  ]

  const thetaAfter = estimateTheta(observations, thetaBefore)

  const defaultParams = question.difficulty === "easy"
    ? { a: 0.95, b: -0.8 }
    : question.difficulty === "hard"
    ? { a: 1.25, b: 0.8 }
    : { a: 1.1, b: 0 }

  const expectedProbability = probabilityCorrect(thetaBefore, defaultParams.a, defaultParams.b)
  const informationValue = itemInformation(thetaBefore, defaultParams.a, defaultParams.b)

  const newHistory: SessionResponse[] = [
    ...existingHistory,
    {
      questionId,
      selectedIndex,
      confidence,
      timeSpent,
      correct,
      thetaBefore,
      thetaAfter,
      expectedProbability,
      informationValue,
    },
  ]

  const newAskedIds = [...askedQuestionIds, questionId]
  const nextQuestion = selectMostInformativeQuestion(thetaAfter, newAskedIds)

  const { error: updateError } = await auth.supabase
    .from("assessment_sessions")
    .update({
      theta: thetaAfter,
      asked_question_ids: newAskedIds,
      response_history: newHistory,
      status: nextQuestion ? "active" : "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", auth.user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (!nextQuestion) {
    return finalizeSessionAndPersistAttempt(auth.supabase, auth.user.id, {
      id: sessionId,
      response_history: newHistory,
      status: "completed",
    })
  }

  return NextResponse.json({
    completed: false,
    theta: thetaAfter,
    answeredCount: newAskedIds.length,
    totalQuestions: assessmentQuestionBank.length,
    question: toPublicQuestions([nextQuestion])[0],
  })
}
