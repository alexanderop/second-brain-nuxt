/**
 * Mock for #imports used in unit tests
 * Provides stubs for Nuxt-specific composables
 */
/* eslint-disable @typescript-eslint/consistent-type-assertions -- Type assertions required for mock utilities */
import { ref } from 'vue'
import type { Ref } from 'vue'

// Mock useState - returns a simple ref
export function useState<T>(_key: string, init?: () => T): Ref<T> {
  const value = init ? init() : (undefined as T)
  return ref(value) as Ref<T>
}
/* eslint-enable @typescript-eslint/consistent-type-assertions */

// Re-export Vue APIs that are also in #imports
export { ref, computed, watch, watchEffect, readonly, toRef, toRefs } from 'vue'
