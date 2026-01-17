import type { FeatureExtractionPipeline } from '@huggingface/transformers'
import { ref, shallowRef } from 'vue'
import { z } from 'zod'
import { tryCatchAsync } from '#shared/utils/tryCatch'
import { dotProduct } from '~/utils/cosineSimilarity'
import type { EmbeddingsData, SemanticSearchResult } from '~/types/embeddings'

/**
 * Zod schema for runtime validation of embeddings.json.
 * Ensures the fetched data matches the expected structure.
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

/**
 * Module-level cache for embeddings and model.
 * This is intentionally a singleton pattern to avoid re-loading
 * the embeddings file and ML model on every component mount.
 * The cache persists for the lifetime of the page session.
 */
let embeddingsCache: EmbeddingsData | null = null
let modelCache: FeatureExtractionPipeline | null = null
let modelLoadingPromise: Promise<FeatureExtractionPipeline | null> | null = null

/**
 * Clears the semantic search cache.
 * Useful for testing or when embeddings need to be reloaded.
 */
export function clearSemanticSearchCache(): void {
  embeddingsCache = null
  modelCache = null
  modelLoadingPromise = null
}

export function useSemanticSearch() {
  const isLoading = ref(false)
  const error = shallowRef<Error | null>(null)

  async function loadEmbeddings(): Promise<EmbeddingsData | null> {
    if (embeddingsCache) {
      return embeddingsCache
    }

    const [fetchError, response] = await tryCatchAsync(async () => {
      const res = await fetch('/embeddings.json')
      if (!res.ok) {
        throw new Error(`Failed to load embeddings: ${res.status}`)
      }
      const data: unknown = await res.json()

      // Validate the structure at runtime
      const parsed = EmbeddingsDataSchema.parse(data)
      return parsed
    })

    if (fetchError) {
      error.value = fetchError
      return null
    }

    embeddingsCache = response
    return embeddingsCache
  }

  async function loadModel(): Promise<FeatureExtractionPipeline | null> {
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
        error.value = loadError
        modelLoadingPromise = null
        return null
      }

      modelCache = model
      return modelCache
    })()

    return modelLoadingPromise
  }

  async function search(query: string, topN: number = 20): Promise<SemanticSearchResult[]> {
    if (!query.trim()) {
      return []
    }

    isLoading.value = true
    error.value = null

    const [searchError, results] = await tryCatchAsync(async () => {
      // Load embeddings and model in parallel
      const [embeddings, model] = await Promise.all([
        loadEmbeddings(),
        loadModel(),
      ])

      if (!embeddings || !model) {
        return []
      }

      // Generate embedding for query
      const output = await model(query, { pooling: 'mean', normalize: true })
      const queryVector = Array.from(output.data)

      // Compute similarity against all embeddings
      // Using dotProduct since both query and stored embeddings are normalized
      const searchResults: SemanticSearchResult[] = []

      for (const [slug, entry] of Object.entries(embeddings.embeddings)) {
        const score = dotProduct(queryVector, entry.vector)
        searchResults.push({
          slug,
          title: entry.title,
          type: entry.type,
          score,
        })
      }

      // Sort by similarity score descending and return top N
      searchResults.sort((a, b) => b.score - a.score)
      return searchResults.slice(0, topN)
    })

    isLoading.value = false

    if (searchError) {
      error.value = searchError
      return []
    }

    return results
  }

  return {
    search,
    isLoading,
    error,
  }
}
