import { assessmentQuestionBank, getQuestionCountsByCategory, type Confidence, type EngineeringDiscipline } from "@/lib/assessment-bank"

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
  irtScore: number
  confidenceBonus: number
  careerHygieneScore: number
  retentionPrediction: number
  overallScore: number
  explanation: ScoreExplanation
  evaluatedAnswers: Array<AnswerInput & { correct: boolean }>
}

export interface ScoreExplanation {
  formula: string
  weightedContributions: {
    cognitive: number
    behavioral: number
    domain: number
    roleAlignment: number
  }
  strongestDimensions: Array<{ dimension: "cognitive" | "behavioral" | "domain" | "roleAlignment"; score: number; weight: number }>
  riskDimensions: Array<{ dimension: "cognitive" | "behavioral" | "domain" | "roleAlignment"; score: number; weight: number }>
  rationaleTags: string[]
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function getConfidenceValue(confidence: Confidence) {
  if (confidence === "high") {
    return 100
  }

  if (confidence === "medium") {
    return 70
  }

  return 40
}

function getTimeWindow(difficulty: "easy" | "medium" | "hard") {
  if (difficulty === "easy") {
    return { min: 8, ideal: 30, max: 90 }
  }

  if (difficulty === "hard") {
    return { min: 15, ideal: 65, max: 180 }
  }

  return { min: 10, ideal: 45, max: 120 }
}

function getTimePatternFactor(seconds: number, difficulty: "easy" | "medium" | "hard") {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 0.6
  }

  const { min, ideal, max } = getTimeWindow(difficulty)
  if (seconds < min) {
    return 0.6
  }

  if (seconds > max) {
    return 0.7
  }

  const normalizedDistance = Math.abs(seconds - ideal) / Math.max(max - min, 1)
  return Math.max(0.6, 1 - normalizedDistance * 0.6)
}

function computeConfidenceBonus(evaluatedAnswers: Array<AnswerInput & { correct: boolean }>, byId: Map<number, (typeof assessmentQuestionBank)[number]>) {
  if (!evaluatedAnswers.length) {
    return 0
  }

  const aggregate = evaluatedAnswers.reduce((sum, answer) => {
    const question = byId.get(answer.questionId)
    if (!question) {
      return sum
    }

    const confidenceValue = getConfidenceValue(answer.confidence)
    const calibrationFactor = answer.correct ? 1 : (1 - confidenceValue / 160)
    const timePatternFactor = getTimePatternFactor(answer.timeSpent, question.difficulty)
    return sum + (confidenceValue * calibrationFactor * timePatternFactor)
  }, 0)

  return clampScore(aggregate / evaluatedAnswers.length)
}

function buildScoreExplanation(input: {
  cognitiveScore: number
  behavioralScore: number
  domainScore: number
  roleAlignmentScore: number
  retentionPrediction: number
  confidenceBonus: number
}): ScoreExplanation {
  const dimensions = [
    { dimension: "cognitive" as const, score: input.cognitiveScore, weight: 0.3 },
    { dimension: "behavioral" as const, score: input.behavioralScore, weight: 0.3 },
    { dimension: "domain" as const, score: input.domainScore, weight: 0.25 },
    { dimension: "roleAlignment" as const, score: input.roleAlignmentScore, weight: 0.15 },
  ]

  const weightedContributions = {
    cognitive: Number((input.cognitiveScore * 0.3).toFixed(2)),
    behavioral: Number((input.behavioralScore * 0.3).toFixed(2)),
    domain: Number((input.domainScore * 0.25).toFixed(2)),
    roleAlignment: Number((input.roleAlignmentScore * 0.15).toFixed(2)),
  }

  const strongestDimensions = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 2)
  const riskDimensions = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 2)

  const rationaleTags: string[] = []
  if (input.domainScore >= 75) {
    rationaleTags.push("strong-domain-readiness")
  }
  if (input.behavioralScore < 50) {
    rationaleTags.push("behavioral-development-needed")
  }
  if (input.cognitiveScore < 50) {
    rationaleTags.push("cognitive-foundation-risk")
  }
  if (input.retentionPrediction >= 70) {
    rationaleTags.push("high-retention-signal")
  }
  if (input.confidenceBonus < 45) {
    rationaleTags.push("confidence-calibration-risk")
  }

  return {
    formula: "CHS = 0.30C + 0.30B + 0.25D + 0.15R",
    weightedContributions,
    strongestDimensions,
    riskDimensions,
    rationaleTags,
  }
}

export function computeAssessmentScores(answers: AnswerInput[], options?: { irtScore?: number; discipline?: EngineeringDiscipline | null }): ScoreResult {
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

  const counts = getQuestionCountsByCategory(options?.discipline)
  const cognitiveScore = clampScore((cognitiveCorrect / Math.max(counts.cognitive, 1)) * 100)
  const behavioralScore = clampScore((behavioralCorrect / Math.max(counts.behavioral, 1)) * 100)
  const domainScore = clampScore((domainCorrect / Math.max(counts.domain, 1)) * 100)
  const irtScore = clampScore(options?.irtScore ?? 0)
  const confidenceBonus = computeConfidenceBonus(evaluatedAnswers, byId)
  const roleAlignmentScore = clampScore(cognitiveScore * 0.35 + domainScore * 0.45 + behavioralScore * 0.2)
  const overallScore = clampScore(cognitiveScore * 0.3 + behavioralScore * 0.3 + domainScore * 0.4)
  const careerHygieneScore = clampScore((cognitiveScore * 0.3) + (behavioralScore * 0.3) + (domainScore * 0.25) + (roleAlignmentScore * 0.15))
  const retentionPrediction = clampScore(behavioralScore * 0.5 + careerHygieneScore * 0.5)
  const explanation = buildScoreExplanation({
    cognitiveScore,
    behavioralScore,
    domainScore,
    roleAlignmentScore,
    retentionPrediction,
    confidenceBonus,
  })

  return {
    cognitiveScore,
    behavioralScore,
    domainScore,
    roleAlignmentScore,
    irtScore,
    confidenceBonus,
    careerHygieneScore,
    retentionPrediction,
    overallScore,
    explanation,
    evaluatedAnswers,
  }
}

type RiasecVector = {
  R: number
  I: number
  A: number
  S: number
  E: number
  C: number
}

type RecommendationInput = Pick<ScoreResult, "overallScore" | "domainScore" | "behavioralScore" | "retentionPrediction" | "cognitiveScore" | "roleAlignmentScore">

function deriveRiasecVector(scores: RecommendationInput): RiasecVector {
  const { cognitiveScore, behavioralScore, domainScore, overallScore } = scores

  return {
    R: clampScore((domainScore * 0.55) + (behavioralScore * 0.2) + (overallScore * 0.25)),
    I: clampScore((domainScore * 0.45) + (cognitiveScore * 0.45) + (overallScore * 0.1)),
    A: clampScore((cognitiveScore * 0.35) + (behavioralScore * 0.25) + (overallScore * 0.4)),
    S: clampScore((behavioralScore * 0.55) + (cognitiveScore * 0.2) + (overallScore * 0.25)),
    E: clampScore((behavioralScore * 0.45) + (cognitiveScore * 0.25) + (overallScore * 0.3)),
    C: clampScore((behavioralScore * 0.35) + (domainScore * 0.35) + (overallScore * 0.3)),
  }
}

function weightedRiasecFit(weights: Partial<Record<keyof RiasecVector, number>>, vector: RiasecVector) {
  let weightedSum = 0
  let totalWeight = 0

  for (const [code, weight] of Object.entries(weights)) {
    if (!weight) {
      continue
    }

    weightedSum += vector[code as keyof RiasecVector] * weight
    totalWeight += weight
  }

  if (!totalWeight) {
    return 0
  }

  return weightedSum / totalWeight
}

export function getRoleRecommendations(scores: RecommendationInput) {
  const riasec = deriveRiasecVector(scores)

  const roleProfiles = [
    {
      role: "R&D Engineer",
      capability: clampScore((scores.cognitiveScore * 0.38) + (scores.domainScore * 0.34) + (scores.roleAlignmentScore * 0.18) + (scores.overallScore * 0.1)),
      riasecWeights: { I: 0.5, R: 0.3, C: 0.2 },
      retentionBias: 2,
    },
    {
      role: "QA Engineer",
      capability: clampScore((scores.behavioralScore * 0.3) + (scores.domainScore * 0.3) + (scores.roleAlignmentScore * 0.25) + (scores.cognitiveScore * 0.15)),
      riasecWeights: { C: 0.45, I: 0.25, R: 0.2, S: 0.1 },
      retentionBias: 3,
    },
    {
      role: "Technical Support",
      capability: clampScore((scores.behavioralScore * 0.45) + (scores.domainScore * 0.2) + (scores.cognitiveScore * 0.15) + (scores.overallScore * 0.2)),
      riasecWeights: { S: 0.45, C: 0.25, E: 0.2, R: 0.1 },
      retentionBias: 1,
    },
    {
      role: "Project Manager",
      capability: clampScore((scores.behavioralScore * 0.45) + (scores.cognitiveScore * 0.25) + (scores.roleAlignmentScore * 0.2) + (scores.overallScore * 0.1)),
      riasecWeights: { E: 0.4, C: 0.25, S: 0.25, I: 0.1 },
      retentionBias: 0,
    },
    {
      role: "Data Analyst",
      capability: clampScore((scores.cognitiveScore * 0.35) + (scores.domainScore * 0.35) + (scores.roleAlignmentScore * 0.2) + (scores.overallScore * 0.1)),
      riasecWeights: { I: 0.45, C: 0.3, R: 0.15, A: 0.1 },
      retentionBias: 2,
    },
    {
      role: "Field Engineer",
      capability: clampScore((scores.domainScore * 0.4) + (scores.behavioralScore * 0.25) + (scores.cognitiveScore * 0.2) + (scores.roleAlignmentScore * 0.15)),
      riasecWeights: { R: 0.5, I: 0.2, C: 0.2, E: 0.1 },
      retentionBias: -1,
    },
    {
      role: "Sales Engineer",
      capability: clampScore((scores.behavioralScore * 0.4) + (scores.domainScore * 0.2) + (scores.cognitiveScore * 0.2) + (scores.overallScore * 0.2)),
      riasecWeights: { E: 0.45, S: 0.25, I: 0.2, R: 0.1 },
      retentionBias: -2,
    },
    {
      role: "Software Developer",
      capability: clampScore((scores.domainScore * 0.4) + (scores.cognitiveScore * 0.3) + (scores.roleAlignmentScore * 0.2) + (scores.overallScore * 0.1)),
      riasecWeights: { I: 0.4, R: 0.25, C: 0.2, A: 0.15 },
      retentionBias: 3,
    },
  ]

  return roleProfiles
    .map((profile) => {
      const riasecFit = weightedRiasecFit(profile.riasecWeights, riasec)
      const fitPercent = clampScore((profile.capability * 0.55) + (riasecFit * 0.45))
      const retention = clampScore((scores.retentionPrediction * 0.8) + (fitPercent * 0.2) + profile.retentionBias)

      return {
        role: profile.role,
        fitPercent,
        retention,
      }
    })
    .sort((a, b) => b.fitPercent - a.fitPercent)
}
