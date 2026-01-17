import { ref, watch, type Ref } from 'vue'
import { tryCatchAsync } from '#shared/utils/tryCatch'
import { useSemanticSearch } from './useSemanticSearch'
import type { SemanticSearchResult } from '~/types/embeddings'

/**
 * Composable that orchestrates debounced semantic search.
 * Handles the watcher pattern with proper async error handling.
 *
 * @param debouncedQuery - A ref containing the debounced search query
 * @returns Search results, loading state, and error state
 */
export function useDebouncedSemanticSearch(debouncedQuery: Ref<string>) {
  const { search, isLoading, error } = useSemanticSearch()
  const results = ref<SemanticSearchResult[]>([])
  const hasSearchRun = ref(false)

  watch(debouncedQuery, (query) => {
    void (async () => {
      if (!query) {
        results.value = []
        hasSearchRun.value = false
        return
      }

      const [searchError, searchResults] = await tryCatchAsync(() => search(query))

      if (searchError) {
        console.error('Semantic search failed:', searchError)
        return
      }

      results.value = searchResults
      hasSearchRun.value = true
    })()
  })

  return { results, hasSearchRun, isLoading, error }
}
