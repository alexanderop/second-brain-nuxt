import { useNuxtApp, queryCollection, preloadRouteComponents } from '#imports'

/**
 * Composable to prefetch content data on hover for faster navigation.
 * Populates the same cache keys as [...slug].vue so data is ready when navigating.
 */
export function usePrefetchContent() {
  const nuxtApp = useNuxtApp()

  /**
   * Prefetch route components and page data for a content path.
   * Call this on mouseenter to warm the cache before navigation.
   */
  const prefetch = (path: string) => {
    // Normalize path to ensure it starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    // Skip if already cached
    const cacheKey = `page-${normalizedPath}`
    if (nuxtApp.payload.data[cacheKey] || nuxtApp.static.data[cacheKey]) {
      return
    }

    // Prefetch route components (non-blocking)
    void preloadRouteComponents(normalizedPath)

    // Fetch data directly and populate the payload cache.
    // Avoids useAsyncData to prevent "component already mounted" and
    // "incompatible options" warnings when [...slug].vue reads the same key.
    void queryCollection('content').path(normalizedPath).first().then((data) => {
      if (data) {
        nuxtApp.payload.data[cacheKey] = data
      }
    })
  }

  return { prefetch }
}
