import {
  getAssessmentQuestionPool,
  getItemParameters,
  type EngineeringDiscipline,
  type InternalAssessmentQuestion,
} from "@/lib/assessment-bank"

export interface IrtResponseObservation {
  questionId: number
  correct: boolean
}

function clampTheta(theta: number) {
  return Math.max(-4, Math.min(4, theta))
}

function safeProbability(value: number) {
  return Math.max(1e-6, Math.min(1 - 1e-6, value))
}

export function probabilityCorrect(theta: number, a: number, b: number, c: number) {
  const logistic = 1 / (1 + Math.exp(-a * (theta - b)))
  return safeProbability(c + (1 - c) * logistic)
}

export function itemInformation(theta: number, a: number, b: number, c: number) {
  const p = probabilityCorrect(theta, a, b, c)
  const q = 1 - p
  const numerator = (a * a) * Math.pow(p - c, 2) * q
  const denominator = Math.pow(1 - c, 2) * p
  return denominator <= 0 ? 0 : numerator / denominator
}

function logPosterior(theta: number, observations: IrtResponseObservation[]) {
  const priorVariance = 1
  const pool = getAssessmentQuestionPool()
  const byId = new Map(pool.map((question) => [question.id, question]))

  let ll = 0

  for (const observation of observations) {
    const question = byId.get(observation.questionId)
    if (!question) {
      continue
    }

    const { a, b, c } = getItemParameters(question)
    const p = probabilityCorrect(theta, a, b, c)
    ll += observation.correct ? Math.log(p) : Math.log(1 - p)
  }

  const prior = -((theta * theta) / (2 * priorVariance))
  return ll + prior
}

export function estimateTheta(observations: IrtResponseObservation[], initialTheta = 0) {
  if (!observations.length) {
    return 0
  }

  let theta = initialTheta
  const epsilon = 1e-2

  for (let i = 0; i < 12; i += 1) {
    const l0 = logPosterior(theta, observations)
    const lp = logPosterior(theta + epsilon, observations)
    const lm = logPosterior(theta - epsilon, observations)

    const gradient = (lp - lm) / (2 * epsilon)
    const hessian = (lp - (2 * l0) + lm) / (epsilon * epsilon)

    if (Math.abs(hessian) < 1e-6) {
      break
    }

    const nextTheta = theta - (gradient / hessian)
    if (Math.abs(nextTheta - theta) < 1e-3) {
      theta = nextTheta
      break
    }

    theta = nextTheta
  }

  return clampTheta(theta)
}

export function selectMostInformativeQuestion(theta: number, askedQuestionIds: number[], options?: { discipline?: EngineeringDiscipline | null }) {
  const asked = new Set(askedQuestionIds)
  let bestQuestion: InternalAssessmentQuestion | null = null
  let bestInformation = -1

  const pool = getAssessmentQuestionPool(options?.discipline)

  for (const question of pool) {
    if (asked.has(question.id)) {
      continue
    }

    const { a, b, c } = getItemParameters(question)
    const information = itemInformation(theta, a, b, c)

    if (information > bestInformation) {
      bestInformation = information
      bestQuestion = question
    }
  }

  return bestQuestion
}

export function thetaToScore(theta: number) {
  const normalized = 1 / (1 + Math.exp(-theta))
  return Math.round(normalized * 100)
}
