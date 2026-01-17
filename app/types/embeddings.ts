/**
 * Shared type definitions for semantic search and embeddings.
 */

export interface EmbeddingEntry {
  vector: number[]
  title: string
  type: string
  hash?: string // Content hash for incremental generation
}

export interface EmbeddingsData {
  version: string
  model: string
  generatedAt?: string
  textMaxLength?: number
  embeddings: Record<string, EmbeddingEntry>
}

export interface SemanticSearchResult {
  slug: string
  title: string
  type: string
  score: number
}
