/**
 * Computes cosine similarity between two vectors.
 * Returns a value between -1 (opposite) and 1 (identical).
 * Returns 0 for zero vectors to handle edge cases gracefully.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < a.length; i++) {
    const aVal = a[i]!
    const bVal = b[i]!
    dotProduct += aVal * bVal
    magnitudeA += aVal * aVal
    magnitudeB += bVal * bVal
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  // Handle zero vectors gracefully
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (magnitudeA * magnitudeB)
}
