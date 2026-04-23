import { NextResponse } from "next/server"
import { normalizeEngineeringDiscipline } from "@/lib/assessment-bank"
import { estimateTheta, thetaToScore, type IrtResponseObservation } from "@/lib/irt"
import { computeAssessmentScores, getRoleRecommendations, type AnswerInput } from "@/lib/scoring"

type SessionResponse = {
  questionId: number
  discipline?: string | null
  selectedIndex: number
  confidence: "low" | "medium" | "high"
  timeSpent: number
  correct: boolean
  thetaBefore?: number
  thetaAfter?: number
  expectedProbability?: number
  informationValue?: number
}

type SessionAnomalyFlags = {
  rapidResponseCount: number
  repeatedOptionStreak: number
  highConfidenceMisses: number
  anomalyScore: number
}

function analyzeSessionAnomalies(history: SessionResponse[]): SessionAnomalyFlags {
  const rapidResponseCount = history.filter((item) => Number.isFinite(item.timeSpent) && item.timeSpent < 6).length

  let repeatedOptionStreak = 1
  let currentStreak = 1
  for (let index = 1; index < history.length; index += 1) {
    if (history[index].selectedIndex === history[index - 1].selectedIndex) {
      currentStreak += 1
      repeatedOptionStreak = Math.max(repeatedOptionStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  const highConfidenceMisses = history.filter((item) => item.confidence === "high" && !item.correct).length
  const answerCount = Math.max(history.length, 1)
  const rawScore = (rapidResponseCount / answerCount) * 0.45 + (Math.max(repeatedOptionStreak - 2, 0) / answerCount) * 0.35 + (highConfidenceMisses / answerCount) * 0.2

  return {
    rapidResponseCount,
    repeatedOptionStreak,
    highConfidenceMisses,
    anomalyScore: Number(Math.min(1, rawScore).toFixed(4)),
  }
}

export async function finalizeSessionAndPersistAttempt(supabase: any, userId: string, session: {
  id: string
  response_history: SessionResponse[] | null
  status: string
}) {
  const history = Array.isArray(session.response_history) ? session.response_history : []

  if (!history.length) {
    return NextResponse.json({ error: "No responses recorded in session" }, { status: 400 })
  }

  const answerInputs: AnswerInput[] = history.map((item) => ({
    questionId: item.questionId,
    selectedIndex: item.selectedIndex,
    confidence: item.confidence,
    timeSpent: item.timeSpent,
  }))

  const observations: IrtResponseObservation[] = history.map((item) => ({
    questionId: item.questionId,
    correct: item.correct,
  }))
  const discipline = normalizeEngineeringDiscipline(history.find((item) => item.discipline)?.discipline)
  const theta = estimateTheta(observations)
  const irtScore = thetaToScore(theta)
  const scores = computeAssessmentScores(answerInputs, { irtScore, discipline })
  const anomalyFlags = analyzeSessionAnomalies(history)

  const { data: attempt, error: attemptError } = await supabase
    .from("assessment_attempts")
    .insert({
      user_id: userId,
      cognitive_score: scores.cognitiveScore,
      behavioral_score: scores.behavioralScore,
      domain_score: scores.domainScore,
      role_alignment_score: scores.roleAlignmentScore,
      career_hygiene_score: scores.careerHygieneScore,
      retention_prediction: scores.retentionPrediction,
      overall_score: scores.overallScore,
      irt_theta: theta,
      irt_score: irtScore,
      explanation: scores.explanation,
      anomaly_flags: anomalyFlags,
    })
    .select("id")
    .single()

  if (attemptError || !attempt) {
    return NextResponse.json({ error: attemptError?.message ?? "Failed to save attempt" }, { status: 500 })
  }

  const responseRows = history.map((item) => {
    return {
      attempt_id: attempt.id,
      question_id: item.questionId,
      selected_index: item.selectedIndex,
      confidence: item.confidence,
      time_spent_seconds: item.timeSpent,
      is_correct: item.correct,
      theta_before: item.thetaBefore ?? null,
      theta_after: item.thetaAfter ?? theta,
      expected_probability: item.expectedProbability ?? null,
      information_value: item.informationValue ?? null,
      anomaly_score: anomalyFlags.anomalyScore,
    }
  })

  const { error: responseError } = await supabase.from("assessment_responses").insert(responseRows)
  if (responseError) {
    return NextResponse.json({ error: responseError.message }, { status: 500 })
  }

  const { error: sessionUpdateError } = await supabase
    .from("assessment_sessions")
    .update({ status: "completed", theta, updated_at: new Date().toISOString() })
    .eq("id", session.id)
    .eq("user_id", userId)

  if (sessionUpdateError) {
    return NextResponse.json({ error: sessionUpdateError.message }, { status: 500 })
  }

  return NextResponse.json({
    completed: true,
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
      anomalyFlags,
    },
    recommendedRoles: getRoleRecommendations(scores),
  })
}
