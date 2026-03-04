/**
 * Integration test for useRandomNote composable
 *
 * Tests that the composable properly caches stems via useAsyncData
 * to avoid repeated queries on each "r" keypress.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, nextTick } from 'vue'
import { createQueryCollectionMock } from '../fixtures/query-builder'

// Track how many times queryCollection is called
const queryCollectionCallCount = vi.hoisted(() => ({ value: 0 }))

// Mock navigateTo to prevent actual navigation
const navigateToMock = vi.hoisted(() => vi.fn())

// Mock queryCollection to track calls
mockNuxtImport('queryCollection', () => {
  return () => {
    queryCollectionCallCount.value++
    return createQueryCollectionMock([
      { stem: 'note-1' },
      { stem: 'note-2' },
      { stem: 'note-3' },
    ])()
  }
})

// Mock navigateTo
mockNuxtImport('navigateTo', () => navigateToMock)

describe('useRandomNote', () => {
  beforeEach(() => {
    queryCollectionCallCount.value = 0
    navigateToMock.mockClear()
  })

  it('caches stems via useAsyncData - queryCollection called only once', async () => {
    // Create a test component that uses the composable and calls navigateToRandomNote
    // multiple times after data is loaded
    const TestComponent = defineComponent({
      async setup() {
        const { useRandomNote } = await import('~/composables/useRandomNote')
        const { navigateToRandomNote } = useRandomNote()

        // Wait for data to load (simulates user waiting before pressing "r")
        await nextTick()

        // Call navigateToRandomNote multiple times (simulating multiple "r" keypresses)
        await navigateToRandomNote()
        await navigateToRandomNote()
        await navigateToRandomNote()

        return () => h('div', 'test')
      },
    })

    await mountSuspended(TestComponent)

    // With proper useAsyncData caching, queryCollection should only be called ONCE
    // The bug: without useAsyncData, it was called 3 times (once per navigateToRandomNote)
    expect(queryCollectionCallCount.value).toBe(1)
  })
})
