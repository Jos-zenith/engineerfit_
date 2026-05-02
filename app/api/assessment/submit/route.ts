import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { assessmentQuestionBank, normalizeEngineeringDiscipline } from "@/lib/assessment-bank"
import { estimateTheta, thetaToScore, type IrtResponseObservation } from "@/lib/irt"
import { computeAssessmentScores, getRoleRecommendations, type AnswerInput } from "@/lib/scoring"

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const answers = Array.isArray(body?.answers) ? (body.answers as AnswerInput[]) : []
  const discipline = normalizeEngineeringDiscipline(body?.discipline)

  if (!answers.length) {
    return NextResponse.json({ error: "answers is required" }, { status: 400 })
  }

  const byId = new Map(assessmentQuestionBank.map((question) => [question.id, question]))
  const observations: IrtResponseObservation[] = answers
    .map((answer) => {
      const question = byId.get(answer.questionId)
      if (!question) {
        return null
      }

      return {
        questionId: answer.questionId,
        correct: answer.selectedIndex === question.correctIndex,
      }
    })
    .filter((item): item is IrtResponseObservation => Boolean(item))

  const theta = estimateTheta(observations)
  const irtScore = thetaToScore(theta)
  const scores = computeAssessmentScores(answers, { irtScore, discipline })

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      userId: auth.user.id,
      cognitive_score: scores.cognitiveScore,
      behavioral_score: scores.behavioralScore,
      domain_score: scores.domainScore,
      role_alignment_score: scores.roleAlignmentScore,
      career_hygiene_score: scores.careerHygieneScore,
      retention_prediction: scores.retentionPrediction,
      overall_score: scores.overallScore,
      irt_theta: theta,
      irt_score: irtScore,
      explanation: scores.explanation ? JSON.stringify(scores.explanation) : null,
    },
  })

  const responseRows = scores.evaluatedAnswers.map((answer) => ({
    attempt_id: attempt.id,
    question_id: answer.questionId,
    selected_index: answer.selectedIndex,
    confidence: answer.confidence,
    time_spent_seconds: answer.timeSpent,
    is_correct: answer.correct,
  }))

  await prisma.assessmentResponse.createMany({
    data: responseRows,
  })

  const recommendedRoles = getRoleRecommendations(scores)

  return NextResponse.json({
    scores: {
      cogScore: scores.cognitiveScore,
      behScore: scores.behavioralScore,
      domScore: scores.domainScore,
      overall: scores.overallScore,
      careerHygieneScore: scores.careerHygieneScore,
      retentionPrediction: scores.retentionPrediction,
      roleAlignmentScore: scores.roleAlignmentScore,
      irtTheta: theta,
      irtScore,
      confidenceBonus: scores.confidenceBonus,
      explanation: scores.explanation,
    },
    recommendedRoles,
  })
}
