/**
 * Hybrid Search Scoring
 *
 * Combines keyword search scores with semantic search scores
 * to produce a unified ranking of search results.
 */

import type { SemanticSearchResult } from '~/types/embeddings'

// Scoring weights - keyword matches are precise, semantic captures meaning
export const KEYWORD_WEIGHT = 0.4
export const SEMANTIC_WEIGHT = 0.6

export interface KeywordResult {
  slug: string
  title: string
  score: number
}

// Re-export SemanticSearchResult as SemanticResult for backwards compatibility
export type SemanticResult = SemanticSearchResult

export interface HybridResult {
  slug: string
  title: string
  type?: string
  keywordScore: number
  semanticScore: number
  hybridScore: number
}

/**
 * Computes hybrid score from keyword and semantic scores.
 * Formula: (keyword_score * 0.4) + (semantic_score * 0.6)
 */
export function computeHybridScore(keywordScore: number, semanticScore: number): number {
  return keywordScore * KEYWORD_WEIGHT + semanticScore * SEMANTIC_WEIGHT
}

/**
 * Merges keyword and semantic search results into a hybrid-scored list.
 *
 * - Results are matched by slug
 * - Keyword-only results get semanticScore = 0
 * - Semantic-only results get keywordScore = 0
 * - Deduplicated by slug
 * - Sorted by hybrid score descending
 */
export function mergeSearchResults(
  keywordResults: KeywordResult[],
  semanticResults: SemanticResult[],
): HybridResult[] {
  const resultMap = new Map<string, HybridResult>()

  // Process keyword results first
  for (const kr of keywordResults) {
    resultMap.set(kr.slug, {
      slug: kr.slug,
      title: kr.title,
      keywordScore: kr.score,
      semanticScore: 0,
      hybridScore: computeHybridScore(kr.score, 0),
    })
  }

  // Merge semantic results
  for (const sr of semanticResults) {
    const existing = resultMap.get(sr.slug)
    if (existing) {
      // Update with semantic score
      existing.semanticScore = sr.score
      existing.type = sr.type
      existing.hybridScore = computeHybridScore(existing.keywordScore, sr.score)
      continue
    }

    // Semantic-only result
    resultMap.set(sr.slug, {
      slug: sr.slug,
      title: sr.title,
      type: sr.type,
      keywordScore: 0,
      semanticScore: sr.score,
      hybridScore: computeHybridScore(0, sr.score),
    })
  }

  // Convert to array and sort by hybrid score descending
  const results = Array.from(resultMap.values())
  results.sort((a, b) => b.hybridScore - a.hybridScore)

  return results
}
