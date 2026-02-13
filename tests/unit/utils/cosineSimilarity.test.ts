import { describe, expect, it } from 'vitest'
import { cosineSimilarity, dotProduct } from '../../../app/utils/cosineSimilarity'

describe('dotProduct', () => {
  it('computes dot product of identical vectors', () => {
    const vector = [1, 2, 3, 4, 5]
    const result = dotProduct(vector, vector)
    expect(result).toBe(55) // 1 + 4 + 9 + 16 + 25
  })

  it('computes dot product of orthogonal vectors', () => {
    const a = [1, 0, 0]
    const b = [0, 1, 0]
    expect(dotProduct(a, b)).toBe(0)
  })

  it('computes dot product of arbitrary vectors', () => {
    const a = [1, 2, 3]
    const b = [4, 5, 6]
    expect(dotProduct(a, b)).toBe(32) // 4 + 10 + 18
  })

  it('handles negative values', () => {
    const a = [1, -2, 3]
    const b = [-4, 5, -6]
    expect(dotProduct(a, b)).toBe(-32) // -4 + -10 + -18
  })

  it('throws error for mismatched vector lengths', () => {
    const a = [1, 2, 3]
    const b = [1, 2]
    expect(() => dotProduct(a, b)).toThrow('Vector length mismatch: 3 vs 2')
  })
})

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const vector = [1, 2, 3, 4, 5]
    expect(cosineSimilarity(vector, vector)).toBeCloseTo(1)
  })

  it('returns 1 for parallel vectors with different magnitudes', () => {
    const a = [1, 2, 3]
    const b = [2, 4, 6]
    expect(cosineSimilarity(a, b)).toBeCloseTo(1)
  })

  it('returns 0 for orthogonal vectors', () => {
    const a = [1, 0, 0]
    const b = [0, 1, 0]
    expect(cosineSimilarity(a, b)).toBeCloseTo(0)
  })

  it('returns -1 for opposite vectors', () => {
    const a = [1, 2, 3]
    const b = [-1, -2, -3]
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1)
  })

  it('returns 0 when first vector is zero', () => {
    const zero = [0, 0, 0]
    const vector = [1, 2, 3]
    expect(cosineSimilarity(zero, vector)).toBe(0)
  })

  it('returns 0 when second vector is zero', () => {
    const vector = [1, 2, 3]
    const zero = [0, 0, 0]
    expect(cosineSimilarity(vector, zero)).toBe(0)
  })

  it('returns 0 when both vectors are zero', () => {
    const zero = [0, 0, 0]
    expect(cosineSimilarity(zero, zero)).toBe(0)
  })

  it('handles 384-dimension vectors efficiently', () => {
    const dim = 384
    const a = Array.from({ length: dim }, (_, i) => Math.sin(i))
    const b = Array.from({ length: dim }, (_, i) => Math.cos(i))

    const start = performance.now()
    const result = cosineSimilarity(a, b)
    const elapsed = performance.now() - start

    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(-1)
    expect(result).toBeLessThanOrEqual(1)
    expect(elapsed).toBeLessThan(10) // Should complete in under 10ms
  })

  it('throws error for mismatched vector lengths', () => {
    const a = [1, 2, 3]
    const b = [1, 2]
    expect(() => cosineSimilarity(a, b)).toThrow('Vector length mismatch: 3 vs 2')
  })

  it('handles negative values correctly', () => {
    const a = [-1, 2, -3]
    const b = [1, -2, 3]
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1)
  })

  it('handles floating point values', () => {
    const a = [0.5, 0.5, 0.5]
    const b = [0.5, 0.5, 0.5]
    expect(cosineSimilarity(a, b)).toBeCloseTo(1)
  })
})
