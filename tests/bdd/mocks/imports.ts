/**
 * Mock for #imports used in BDD tests
 *
 * Provides mock implementations for Nuxt-specific composables
 * while allowing real Vue reactivity to work.
 */
/* eslint-disable @typescript-eslint/consistent-type-assertions, no-restricted-imports */
import { ref, computed, watch, watchEffect, reactive, readonly, toRef, toRefs, nextTick, provide, inject } from 'vue'
import type { Ref } from 'vue'
import { vi } from 'vitest'

// Re-export Vue APIs that are also in #imports
export { ref, computed, watch, watchEffect, reactive, readonly, toRef, toRefs, nextTick, provide, inject }

// ============================================
// Nuxt Core Composables
// ============================================

/** Mock useState - returns a simple ref */
export function useState<T>(key: string, init?: () => T): Ref<T> {
  const value = init ? init() : (undefined as T)
  return ref(value) as Ref<T>
}

/** Mock route state - reactive object that can be watched */
const mockRouteState = reactive({
  path: '/',
  params: {} as Record<string, string>,
  query: {} as Record<string, string>,
  fullPath: '/',
  name: undefined as string | undefined,
  hash: '',
  matched: [] as unknown[],
  meta: {} as Record<string, unknown>,
})

/** Mock useRoute - returns reactive route object */
export function useRoute() {
  return mockRouteState
}

/** Helper to update mock route in tests */
export function setMockRoute(route: Partial<typeof mockRouteState>) {
  Object.assign(mockRouteState, route)
}

/** Helper to reset mock route to defaults */
export function resetMockRoute() {
  Object.assign(mockRouteState, {
    path: '/',
    params: {},
    query: {},
    fullPath: '/',
    name: undefined,
    hash: '',
    matched: [],
    meta: {},
  })
}

/** Mock useRouter */
export function useRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: mockRoute,
  }
}

/** Mock navigateTo */
export const navigateTo = vi.fn()

/** Mock useAsyncData - vi.fn() for test configuration */
export const useAsyncData = vi.fn(<T>(
  key: string,
  handler: () => Promise<T>,
  options?: { immediate?: boolean }
) => {
  const data = ref<T | null>(null) as Ref<T | null>
  const pending = ref(true)
  const error = ref<Error | null>(null)

  const execute = async () => {
    pending.value = true
    try {
      data.value = await handler()
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      pending.value = false
    }
  }

  // Execute immediately (synchronously start, but don't await)
  if (options?.immediate !== false) {
    execute()
  }

  // Return the refs directly (not wrapped in another object)
  return { data, pending, error, execute, refresh: execute }
})

/** Mock useFetch */
export function useFetch<T>(url: string, _options?: Record<string, unknown>) {
  return useAsyncData(`fetch-${url}`, async () => {
    // Return empty data by default - tests should mock $fetch
    return null as T
  })
}

/** Mock useSeoMeta */
export const useSeoMeta = vi.fn()

/** Mock useHead */
export const useHead = vi.fn()

/** Mock createError */
export function createError(opts: { statusCode: number, message: string }) {
  const error = new Error(opts.message) as Error & { statusCode: number }
  error.statusCode = opts.statusCode
  return error
}

// ============================================
// Nuxt Content Composables
// ============================================

/** Helper to create a chainable query builder */
function createQueryBuilder(data: unknown[] = []) {
  const builder = {
    path: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(data[0] ?? null),
    all: vi.fn().mockResolvedValue(data),
    count: vi.fn().mockResolvedValue(data.length),
  }
  return builder
}

/** Mock queryCollection - vi.fn() that returns chainable builder */
export const queryCollection = vi.fn(() => createQueryBuilder())

/** Mock queryCollectionSearchSections */
export const queryCollectionSearchSections = vi.fn().mockResolvedValue([])

// ============================================
// Nuxt UI Composables
// ============================================

/** Mock useColorMode */
export function useColorMode() {
  const mode = ref('light')
  return {
    value: mode.value,
    preference: mode,
    forced: ref(false),
  }
}

/** Mock defineShortcuts */
export const defineShortcuts = vi.fn()

/** Mock useToast */
export function useToast() {
  return {
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  }
}

// ============================================
// App-specific Composables
// ============================================

/** Mock useSiteConfig */
export function useSiteConfig() {
  return {
    name: 'Test Site',
    description: 'Test description',
    navigation: [],
    shortcuts: [],
  }
}

/** Mock usePageTitle */
export function usePageTitle(title: string) {
  useSeoMeta({ title: `${title} - Test Site` })
}

// ============================================
// Fetch Mocks
// ============================================

/** Mock $fetch */
export const $fetch = vi.fn()
