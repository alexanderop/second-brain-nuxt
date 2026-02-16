import { useNuxtApp, useAsyncData, queryCollection, preloadRouteComponents } from '#imports'

/**
 * Composable to prefetch content data on hover for faster navigation.
 * Uses the same cache keys as [...slug].vue so data is ready when navigating.
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

    // Prefetch page data with same cache key as [...slug].vue
    // Using server: false since we only need client-side prefetch
    useAsyncData(
      cacheKey,
      () => queryCollection('content').path(normalizedPath).first(),
      { server: false, immediate: true },
    )
  }

  return { prefetch }
}
