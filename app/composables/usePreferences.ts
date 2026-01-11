import { useLocalStorage } from '@vueuse/core'
import {
  addTermToHistory,
  DEFAULT_GRAPH_SETTINGS,
  type GraphSettings,
} from '~/utils/preferencesLogic'

export function usePreferences() {
  const searchHistory = useLocalStorage<Array<string>>('sb-search-history', [])
  const graphSettings = useLocalStorage<GraphSettings>('sb-graph-settings', DEFAULT_GRAPH_SETTINGS)

  function addSearchHistory(term: string) {
    searchHistory.value = addTermToHistory(searchHistory.value, term)
  }

  function clearSearchHistory() {
    searchHistory.value = []
  }

  return {
    searchHistory,
    graphSettings,
    addSearchHistory,
    clearSearchHistory,
  }
}
