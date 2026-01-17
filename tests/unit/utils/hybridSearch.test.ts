import { describe, expect, it } from 'vitest'
import {
  KEYWORD_WEIGHT,
  SEMANTIC_WEIGHT,
  computeHybridScore,
  mergeSearchResults,
} from '../../../app/utils/hybridSearch'
import type { KeywordResult, SemanticResult } from '../../../app/utils/hybridSearch'

describe('hybridSearch', () => {
  describe('constants', () => {
    it('has weights that sum to 1', () => {
      expect(KEYWORD_WEIGHT + SEMANTIC_WEIGHT).toBe(1)
    })

    it('has KEYWORD_WEIGHT of 0.4', () => {
      expect(KEYWORD_WEIGHT).toBe(0.4)
    })

    it('has SEMANTIC_WEIGHT of 0.6', () => {
      expect(SEMANTIC_WEIGHT).toBe(0.6)
    })
  })

  describe('computeHybridScore', () => {
    it('applies correct weights', () => {
      const result = computeHybridScore(1, 1)
      expect(result).toBe(1)
    })

    it('returns 0.4 for keyword-only score of 1', () => {
      const result = computeHybridScore(1, 0)
      expect(result).toBe(0.4)
    })

    it('returns 0.6 for semantic-only score of 1', () => {
      const result = computeHybridScore(0, 1)
      expect(result).toBe(0.6)
    })

    it('returns 0 for zero scores', () => {
      const result = computeHybridScore(0, 0)
      expect(result).toBe(0)
    })

    it('handles fractional scores correctly', () => {
      const result = computeHybridScore(0.5, 0.5)
      expect(result).toBeCloseTo(0.5)
    })
  })

  describe('mergeSearchResults', () => {
    it('returns empty array for empty inputs', () => {
      const result = mergeSearchResults([], [])
      expect(result).toEqual([])
    })

    it('includes keyword-only results with semanticScore = 0', () => {
      const keywordResults: KeywordResult[] = [
        { slug: 'test-note', title: 'Test Note', score: 0.8 },
      ]
      const result = mergeSearchResults(keywordResults, [])

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        slug: 'test-note',
        title: 'Test Note',
        keywordScore: 0.8,
        semanticScore: 0,
        hybridScore: 0.8 * 0.4,
      })
    })

    it('includes semantic-only results with keywordScore = 0', () => {
      const semanticResults: SemanticResult[] = [
        { slug: 'semantic-note', title: 'Semantic Note', type: 'note', score: 0.9 },
      ]
      const result = mergeSearchResults([], semanticResults)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        slug: 'semantic-note',
        title: 'Semantic Note',
        type: 'note',
        keywordScore: 0,
        semanticScore: 0.9,
        hybridScore: 0.9 * 0.6,
      })
    })

    it('merges results with same slug', () => {
      const keywordResults: KeywordResult[] = [
        { slug: 'shared-note', title: 'Shared Note', score: 0.7 },
      ]
      const semanticResults: SemanticResult[] = [
        { slug: 'shared-note', title: 'Shared Note', type: 'article', score: 0.8 },
      ]
      const result = mergeSearchResults(keywordResults, semanticResults)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        slug: 'shared-note',
        title: 'Shared Note',
        type: 'article',
        keywordScore: 0.7,
        semanticScore: 0.8,
        hybridScore: 0.7 * 0.4 + 0.8 * 0.6,
      })
    })

    it('deduplicates results by slug', () => {
      const keywordResults: KeywordResult[] = [
        { slug: 'note-a', title: 'Note A', score: 0.5 },
        { slug: 'note-b', title: 'Note B', score: 0.6 },
      ]
      const semanticResults: SemanticResult[] = [
        { slug: 'note-a', title: 'Note A', type: 'note', score: 0.7 },
        { slug: 'note-c', title: 'Note C', type: 'note', score: 0.8 },
      ]
      const result = mergeSearchResults(keywordResults, semanticResults)

      const slugs = result.map(r => r.slug)
      expect(slugs).toHaveLength(3)
      expect(slugs).toContain('note-a')
      expect(slugs).toContain('note-b')
      expect(slugs).toContain('note-c')
    })

    it('sorts results by hybrid score descending', () => {
      const keywordResults: KeywordResult[] = [
        { slug: 'low-score', title: 'Low Score', score: 0.2 },
        { slug: 'high-keyword', title: 'High Keyword', score: 1.0 },
      ]
      const semanticResults: SemanticResult[] = [
        { slug: 'high-semantic', title: 'High Semantic', type: 'note', score: 1.0 },
        { slug: 'medium', title: 'Medium', type: 'note', score: 0.5 },
      ]
      const result = mergeSearchResults(keywordResults, semanticResults)

      // Verify sorted by hybrid score descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!.hybridScore).toBeGreaterThanOrEqual(result[i + 1]!.hybridScore)
      }

      // High semantic (0.6) should beat high keyword (0.4)
      expect(result[0]!.slug).toBe('high-semantic')
    })

    it('handles mixed results correctly', () => {
      const keywordResults: KeywordResult[] = [
        { slug: 'both', title: 'Both', score: 0.8 },
        { slug: 'keyword-only', title: 'Keyword Only', score: 0.9 },
      ]
      const semanticResults: SemanticResult[] = [
        { slug: 'both', title: 'Both', type: 'note', score: 0.9 },
        { slug: 'semantic-only', title: 'Semantic Only', type: 'note', score: 0.7 },
      ]
      const result = mergeSearchResults(keywordResults, semanticResults)

      expect(result).toHaveLength(3)

      const both = result.find(r => r.slug === 'both')
      expect(both?.keywordScore).toBe(0.8)
      expect(both?.semanticScore).toBe(0.9)

      const keywordOnly = result.find(r => r.slug === 'keyword-only')
      expect(keywordOnly?.keywordScore).toBe(0.9)
      expect(keywordOnly?.semanticScore).toBe(0)

      const semanticOnly = result.find(r => r.slug === 'semantic-only')
      expect(semanticOnly?.keywordScore).toBe(0)
      expect(semanticOnly?.semanticScore).toBe(0.7)
    })

    it('preserves type from semantic results', () => {
      const keywordResults: KeywordResult[] = [
        { slug: 'typed-note', title: 'Typed Note', score: 0.5 },
      ]
      const semanticResults: SemanticResult[] = [
        { slug: 'typed-note', title: 'Typed Note', type: 'podcast', score: 0.6 },
      ]
      const result = mergeSearchResults(keywordResults, semanticResults)

      expect(result[0]?.type).toBe('podcast')
    })
  })
})
