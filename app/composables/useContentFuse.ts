import { computed, type Ref } from 'vue'
import Fuse, { type IFuseOptions } from 'fuse.js'

/**
 * Default Fuse.js options for content search.
 * Optimized for searching notes, articles, and documentation.
 */
export function getDefaultFuseOptions<T>(): IFuseOptions<T> {
  return {
    keys: [
      { name: 'title', weight: 1 },
      { name: 'label', weight: 1 },
      { name: 'content', weight: 0.7 },
      { name: 'description', weight: 0.7 },
      { name: 'titles', weight: 0.8 },
      { name: 'keywords', weight: 0.9 },
      { name: 'tags', weight: 0.9 },
      { name: 'name', weight: 1 },
    ],
    includeMatches: true,
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }
}

/**
 * Creates a Fuse.js instance for content search.
 * Each call creates a new computed that tracks its own instance,
 * recreating when items length changes.
 *
 * @param items - Reactive reference to searchable items
 * @param options - Optional Fuse.js configuration overrides
 * @returns Computed Fuse instance
 */
export function useContentFuse<T>(
  items: Ref<T[]>,
  options?: IFuseOptions<T>,
) {
  let cachedFuse: Fuse<T> | null = null
  let cachedLength = 0
  const fuseOptions = options ?? getDefaultFuseOptions<T>()

  const fuse = computed(() => {
    if (items.value.length === 0) return null

    // Return cached instance if items length hasn't changed
    if (cachedFuse && items.value.length === cachedLength) {
      return cachedFuse
    }

    // Create new instance and cache it
    cachedFuse = new Fuse(items.value, fuseOptions)
    cachedLength = items.value.length

    return cachedFuse
  })

  return { fuse }
}
