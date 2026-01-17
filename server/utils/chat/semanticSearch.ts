/**
 * Server-side semantic search utilities for chat.
 *
 * Provides embedding loading and semantic search capabilities
 * adapted from the client-side implementation for use in API routes.
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FeatureExtractionPipeline } from '@huggingface/transformers'
import { z } from 'zod'
import { tryCatchAsync } from '../../../shared/utils/tryCatch'

/**
 * Zod schema for runtime validation of embeddings.json.
 */
const EmbeddingEntrySchema = z.object({
  vector: z.array(z.number()),
  title: z.string(),
  type: z.string(),
})

const EmbeddingsDataSchema = z.object({
  version: z.string(),
  model: z.string(),
  embeddings: z.record(z.string(), EmbeddingEntrySchema),
})

// Types matching the client-side embeddings structure
export interface EmbeddingEntry {
  vector: number[]
  title: string
  type: string
}

export interface EmbeddingsData {
  version: string
  model: string
  embeddings: Record<string, EmbeddingEntry>
}

export interface SemanticSearchResult {
  slug: string
  title: string
  type: string
  score: number
}

// Module-level cache (singleton pattern)
let embeddingsCache: EmbeddingsData | null = null
let modelCache: FeatureExtractionPipeline | null = null
let modelLoadingPromise: Promise<FeatureExtractionPipeline | null> | null = null

/**
 * Clears the semantic search cache.
 * Useful for testing or when embeddings need to be reloaded.
 */
export function clearServerSemanticSearchCache(): void {
  embeddingsCache = null
  modelCache = null
  modelLoadingPromise = null
}

/**
 * Computes dot product between two pre-normalized vectors.
 * For normalized vectors, this is equivalent to cosine similarity.
 */
function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i]
    const bVal = b[i]
    if (aVal !== undefined && bVal !== undefined) {
      sum += aVal * bVal
    }
  }
  return sum
}

/**
 * Loads embeddings from public/embeddings.json.
 * Uses caching to avoid repeated file reads.
 */
export async function loadEmbeddings(): Promise<EmbeddingsData | null> {
  if (embeddingsCache) {
    return embeddingsCache
  }

  const [readError, data] = await tryCatchAsync(async () => {
    // In development, read from public directory
    // In production, the file is in .output/public
    const publicDir = process.env.NODE_ENV === 'production'
      ? join(process.cwd(), '.output', 'public')
      : join(process.cwd(), 'public')

    const filePath = join(publicDir, 'embeddings.json')
    const content = await readFile(filePath, 'utf-8')
    const data: unknown = JSON.parse(content)
    return EmbeddingsDataSchema.parse(data)
  })

  if (readError) {
    console.error('[semanticSearch] Failed to load embeddings:', readError)
    return null
  }

  embeddingsCache = data
  return embeddingsCache
}

/**
 * Lazily loads the ML model for generating query embeddings.
 * Uses a loading promise to prevent duplicate model loads.
 */
export async function loadModel(): Promise<FeatureExtractionPipeline | null> {
  if (modelCache) {
    return modelCache
  }

  // If already loading, wait for the existing promise
  if (modelLoadingPromise) {
    return modelLoadingPromise
  }

  modelLoadingPromise = (async () => {
    const [loadError, model] = await tryCatchAsync(async () => {
      // Lazy-load Transformers.js only when needed
      const { pipeline } = await import('@huggingface/transformers')
      return pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5')
    })

    if (loadError) {
      console.error('[semanticSearch] Failed to load model:', loadError)
      modelLoadingPromise = null
      return null
    }

    modelCache = model
    return modelCache
  })()

  return modelLoadingPromise
}

/**
 * Generates an embedding vector for the given query text.
 */
export async function computeQueryEmbedding(query: string): Promise<number[] | null> {
  const model = await loadModel()
  if (!model) {
    return null
  }

  const [error, output] = await tryCatchAsync(async () => {
    return model(query, { pooling: 'mean', normalize: true })
  })

  if (error) {
    console.error('[semanticSearch] Failed to compute query embedding:', error)
    return null
  }

  return Array.from(output.data)
}

/**
 * Performs semantic search against the embeddings.
 *
 * @param query - Search query text
 * @param topN - Number of results to return (default 20)
 * @returns Ranked search results with similarity scores
 */
export async function semanticSearch(
  query: string,
  topN: number = 20,
): Promise<SemanticSearchResult[]> {
  if (!query.trim()) {
    return []
  }

  // Load embeddings and compute query embedding
  const [embeddings, queryVector] = await Promise.all([
    loadEmbeddings(),
    computeQueryEmbedding(query),
  ])

  if (!embeddings || !queryVector) {
    return []
  }

  // Compute similarity against all embeddings
  const results: SemanticSearchResult[] = []

  for (const [slug, entry] of Object.entries(embeddings.embeddings)) {
    const score = dotProduct(queryVector, entry.vector)
    results.push({
      slug,
      title: entry.title,
      type: entry.type,
      score,
    })
  }

  // Sort by similarity score descending and return top N
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topN)
}

/**
 * Finds semantically similar notes to a given slug.
 * Useful for "related notes" functionality.
 *
 * @param slug - The note slug to find similar notes for
 * @param topN - Number of similar notes to return
 * @returns Similar notes (excluding the source note)
 */
export async function findSimilarNotes(
  slug: string,
  topN: number = 5,
): Promise<SemanticSearchResult[]> {
  const embeddings = await loadEmbeddings()
  if (!embeddings) {
    return []
  }

  const sourceEntry = embeddings.embeddings[slug]
  if (!sourceEntry) {
    return []
  }

  const results: SemanticSearchResult[] = []

  for (const [otherSlug, entry] of Object.entries(embeddings.embeddings)) {
    // Skip the source note itself
    if (otherSlug === slug) {
      continue
    }

    const score = dotProduct(sourceEntry.vector, entry.vector)
    results.push({
      slug: otherSlug,
      title: entry.title,
      type: entry.type,
      score,
    })
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topN)
}
