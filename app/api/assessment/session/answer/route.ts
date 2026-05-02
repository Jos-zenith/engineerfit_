import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import {
  type EngineeringDiscipline,
  getItemParameters,
  getQuestionById,
  getQuestionCountsByCategory,
  normalizeEngineeringDiscipline,
  toPublicQuestions,
} from "@/lib/assessment-bank"
import { estimateTheta, itemInformation, probabilityCorrect, selectMostInformativeQuestion, type IrtResponseObservation } from "@/lib/irt"
import { finalizeSessionAndPersistAttempt } from "@/lib/assessment-session"
import { z } from "zod"

const answerPayloadSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.number().int().positive(),
  selectedIndex: z.number().int().min(0).max(3),
  confidence: z.enum(["low", "medium", "high"]),
  timeSpent: z.number().positive(),
  discipline: z.string().optional().nullable(),
})

interface SessionResponse {
  questionId: number
  discipline?: EngineeringDiscipline | null
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
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = answerPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      error: "Invalid answer payload",
      code: "VALIDATION_FAILED",
      details: parsed.error.flatten(),
    }, { status: 400 })
  }

  const sessionId = parsed.data.sessionId
  const questionId = parsed.data.questionId
  const selectedIndex = parsed.data.selectedIndex
  const discipline = normalizeEngineeringDiscipline(parsed.data.discipline)
  const confidence = parsed.data.confidence
  const timeSpent = parsed.data.timeSpent

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.userId !== auth.user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  if (session.status !== "active") {
    return NextResponse.json({ error: "Session is already completed" }, { status: 400 })
  }

  const askedQuestionIds: number[] = JSON.parse(session.asked_question_ids || "[]")
  if (askedQuestionIds.includes(questionId)) {
    return NextResponse.json({ error: "Question already answered" }, { status: 409 })
  }

  const question = getQuestionById(questionId)
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const thetaBefore = session.theta
  const correct = selectedIndex === question.correctIndex

  const existingHistory: SessionResponse[] = JSON.parse(session.response_history || "[]")

  const observations: IrtResponseObservation[] = [
    ...existingHistory.map((entry) => ({ questionId: entry.questionId, correct: entry.correct })),
    { questionId, correct },
  ]

  const thetaAfter = estimateTheta(observations, thetaBefore)

  const defaultParams = getItemParameters(question)

  const expectedProbability = probabilityCorrect(thetaBefore, defaultParams.a, defaultParams.b, defaultParams.c)
  const informationValue = itemInformation(thetaBefore, defaultParams.a, defaultParams.b, defaultParams.c)

  const newHistory: SessionResponse[] = [
    ...existingHistory,
    {
      questionId,
      discipline,
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
  const counts = getQuestionCountsByCategory(discipline)
  const nextQuestion = selectMostInformativeQuestion(thetaAfter, newAskedIds, { discipline })

  await prisma.assessmentSession.update({
    where: { id: sessionId },
    data: {
      theta: thetaAfter,
      asked_question_ids: JSON.stringify(newAskedIds),
      response_history: JSON.stringify(newHistory),
      status: nextQuestion ? "active" : "completed",
      updatedAt: new Date(),
    },
  })

  if (!nextQuestion) {
    return finalizeSessionAndPersistAttempt(auth.user.id, {
      id: sessionId,
      response_history: newHistory,
      status: "completed",
    })
  }

  return NextResponse.json({
    completed: false,
    theta: thetaAfter,
    answeredCount: newAskedIds.length,
    totalQuestions: counts.total,
    categoryTotals: counts,
    question: toPublicQuestions([nextQuestion])[0],
  })
}
