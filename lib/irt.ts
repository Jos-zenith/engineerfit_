import { assessmentQuestionBank, getItemParameters, type InternalAssessmentQuestion } from "@/lib/assessment-bank"

export interface IrtResponseObservation {
  questionId: number
  correct: boolean
}

function clampTheta(theta: number) {
  return Math.max(-4, Math.min(4, theta))
}

export function probabilityCorrect(theta: number, a: number, b: number) {
  return 1 / (1 + Math.exp(-a * (theta - b)))
}

export function itemInformation(theta: number, a: number, b: number) {
  const p = probabilityCorrect(theta, a, b)
  return (a * a) * p * (1 - p)
}

export function estimateTheta(observations: IrtResponseObservation[], initialTheta = 0) {
  if (!observations.length) {
    return 0
  }

  let theta = initialTheta
  const priorVariance = 1

  for (let i = 0; i < 8; i += 1) {
    let gradient = -theta / priorVariance
    let hessian = -(1 / priorVariance)

    for (const observation of observations) {
      const question = assessmentQuestionBank.find((item) => item.id === observation.questionId)
      if (!question) {
        continue
      }

      const { a, b } = getItemParameters(question)
      const p = probabilityCorrect(theta, a, b)
      const u = observation.correct ? 1 : 0

      gradient += a * (u - p)
      hessian += -(a * a) * p * (1 - p)
    }

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

export function selectMostInformativeQuestion(theta: number, askedQuestionIds: number[]) {
  const asked = new Set(askedQuestionIds)
  let bestQuestion: InternalAssessmentQuestion | null = null
  let bestInformation = -1

  for (const question of assessmentQuestionBank) {
    if (asked.has(question.id)) {
      continue
    }

    const { a, b } = getItemParameters(question)
    const information = itemInformation(theta, a, b)

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
