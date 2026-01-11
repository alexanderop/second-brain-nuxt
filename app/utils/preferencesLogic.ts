/**
 * Pure functions for user preferences logic.
 * No Vue imports, no storage access, no side effects.
 */

const MAX_SEARCH_HISTORY = 10

/**
 * Graph visualization settings with sensible defaults.
 */
export interface GraphSettings {
  showLabels: boolean
  chargeStrength: number
}

export const DEFAULT_GRAPH_SETTINGS: GraphSettings = {
  showLabels: true,
  chargeStrength: -300,
}

/**
 * Add a search term to history, removing duplicates and maintaining max size.
 * Returns a new array (immutable).
 *
 * @param currentHistory - The current search history array
 * @param term - The new search term to add
 * @param maxSize - Maximum history size (default 10)
 * @returns New array with term added to front
 */
export function addTermToHistory(
  currentHistory: readonly string[],
  term: string,
  maxSize: number = MAX_SEARCH_HISTORY,
): string[] {
  const trimmed = term.trim()
  if (!trimmed) return [...currentHistory]

  const deduplicated = currentHistory.filter(t => t !== trimmed)
  return [trimmed, ...deduplicated].slice(0, maxSize)
}
