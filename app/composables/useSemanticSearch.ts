import type { FeatureExtractionPipeline } from '@huggingface/transformers'
import { ref, shallowRef } from 'vue'
import { tryCatchAsync } from '#shared/utils/tryCatch'
import { cosineSimilarity } from '~/utils/cosineSimilarity'

interface EmbeddingEntry {
  vector: number[]
  title: string
  type: string
}

interface EmbeddingsData {
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

// Module-level cache for embeddings and model
let embeddingsCache: EmbeddingsData | null = null
let modelCache: FeatureExtractionPipeline | null = null
let modelLoadingPromise: Promise<FeatureExtractionPipeline | null> | null = null

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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- fetch.json() returns unknown, trusted embeddings.json structure
      return res.json() as Promise<EmbeddingsData>
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
      const searchResults: SemanticSearchResult[] = []

      for (const [slug, entry] of Object.entries(embeddings.embeddings)) {
        const score = cosineSimilarity(queryVector, entry.vector)
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
