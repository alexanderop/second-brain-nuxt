import { queryCollection, navigateTo } from '#imports'

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

export function useRandomNote() {
  const navigateToRandomNote = async () => {
    const items = await queryCollection('content').select('stem').all()
    const randomItem = selectRandomItem(items)
    if (!randomItem) return

    await navigateTo(buildNotePath(String(randomItem.stem)))
  }

  return { navigateToRandomNote }
}
