import { useAsyncData, queryCollection, navigateTo } from '#imports'

/** Select a random item from an array. Returns undefined for empty arrays. */
export function selectRandomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  const randomIndex = Math.floor(Math.random() * items.length)
  return items[randomIndex]
}

/** Build a note path from a stem. */
export function buildNotePath(stem: string): string {
  return `/${stem}`
}

interface UseRandomNoteReturn {
  navigateToRandomNote: () => Promise<void>
}

export function useRandomNote(): UseRandomNoteReturn {
  // Cache stems using useAsyncData - fetched once and shared across all usages
  const { data: stems } = useAsyncData(
    'random-note-stems',
    () => queryCollection('content').select('stem').all(),
  )

  async function navigateToRandomNote(): Promise<void> {
    // If data not ready yet, skip navigation
    if (!stems.value) return

    const randomItem = selectRandomItem(stems.value)
    if (!randomItem) return

    await navigateTo(buildNotePath(String(randomItem.stem)))
  }

  return { navigateToRandomNote }
}
