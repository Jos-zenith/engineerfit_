export function cosineSimilarity(studentVector: number[], jobVector: number[]): number {
  if (studentVector.length !== jobVector.length) {
    throw new Error("Vector length mismatch")
  }

  const dot = studentVector.reduce((sum, val, i) => sum + val * jobVector[i], 0)
  const magA = Math.sqrt(studentVector.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(jobVector.reduce((sum, val) => sum + val * val, 0))

  if (magA === 0 || magB === 0) {
    return 0
  }

  return dot / (magA * magB)
}

export function cosineSimilarityPercent(studentVector: number[], jobVector: number[]): number {
  return Math.round(Math.max(0, cosineSimilarity(studentVector, jobVector)) * 100)
}
