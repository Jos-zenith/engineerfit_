import { assessmentQuestionBank, type Confidence } from "@/lib/assessment-bank"

export interface AnswerInput {
  questionId: number
  selectedIndex: number
  confidence: Confidence
  timeSpent: number
}

export interface ScoreResult {
  cognitiveScore: number
  behavioralScore: number
  domainScore: number
  roleAlignmentScore: number
  careerHygieneScore: number
  retentionPrediction: number
  overallScore: number
  evaluatedAnswers: Array<AnswerInput & { correct: boolean }>
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function computeAssessmentScores(answers: AnswerInput[]): ScoreResult {
  const byId = new Map(assessmentQuestionBank.map((question) => [question.id, question]))
  const evaluatedAnswers = answers
    .map((answer) => {
      const question = byId.get(answer.questionId)
      if (!question) {
        return null
      }

      return {
        ...answer,
        correct: answer.selectedIndex === question.correctIndex,
      }
    })
    .filter((answer): answer is AnswerInput & { correct: boolean } => Boolean(answer))

  const cognitiveCorrect = evaluatedAnswers.filter((answer) => {
    const question = byId.get(answer.questionId)
    return question?.category === "cognitive" && answer.correct
  }).length

  const behavioralCorrect = evaluatedAnswers.filter((answer) => {
    const question = byId.get(answer.questionId)
    return question?.category === "behavioral" && answer.correct
  }).length

  const domainCorrect = evaluatedAnswers.filter((answer) => {
    const question = byId.get(answer.questionId)
    return question?.category === "domain" && answer.correct
  }).length

  const cognitiveScore = clampScore((cognitiveCorrect / 5) * 100)
  const behavioralScore = clampScore((behavioralCorrect / 5) * 100)
  const domainScore = clampScore((domainCorrect / 10) * 100)
  const roleAlignmentScore = clampScore(cognitiveScore * 0.35 + domainScore * 0.45 + behavioralScore * 0.2)
  const overallScore = clampScore(cognitiveScore * 0.3 + behavioralScore * 0.3 + domainScore * 0.4)
  const careerHygieneScore = clampScore(cognitiveScore * 0.3 + behavioralScore * 0.3 + domainScore * 0.25 + roleAlignmentScore * 0.15)
  const retentionPrediction = clampScore(behavioralScore * 0.5 + careerHygieneScore * 0.5)

  return {
    cognitiveScore,
    behavioralScore,
    domainScore,
    roleAlignmentScore,
    careerHygieneScore,
    retentionPrediction,
    overallScore,
    evaluatedAnswers,
  }
}

export function getRoleRecommendations(scores: Pick<ScoreResult, "overallScore" | "domainScore" | "behavioralScore" | "retentionPrediction">) {
  const baseline = scores.overallScore
  const recommendations = [
    { role: "Software Developer", fitPercent: clampScore((scores.domainScore * 0.6) + (baseline * 0.4) + 4), retention: clampScore(scores.retentionPrediction + 3) },
    { role: "Data Analyst", fitPercent: clampScore((scores.domainScore * 0.5) + (baseline * 0.5)), retention: clampScore(scores.retentionPrediction) },
    { role: "QA Engineer", fitPercent: clampScore((scores.behavioralScore * 0.45) + (scores.domainScore * 0.35) + (baseline * 0.2)), retention: clampScore(scores.retentionPrediction + 2) },
    { role: "Technical Support", fitPercent: clampScore((scores.behavioralScore * 0.6) + (baseline * 0.4) - 4), retention: clampScore(scores.retentionPrediction - 2) },
  ]

  return recommendations.sort((a, b) => b.fitPercent - a.fitPercent)
}
