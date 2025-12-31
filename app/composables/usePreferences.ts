export function usePreferences() {
  const searchHistory = useLocalStorage<Array<string>>('sb-search-history', [])
  const graphSettings = useLocalStorage('sb-graph-settings', {
    showLabels: true,
    chargeStrength: -300,
  })

  function addSearchHistory(term: string) {
    if (!term.trim())
      return
    // Add to front, remove duplicates, keep max 10
    searchHistory.value = [term, ...searchHistory.value.filter(t => t !== term)].slice(0, 10)
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
