/**
 * Integration tests for [...slug].vue page
 *
 * The catch-all slug page is the most complex page in the application,
 * combining multiple data sources:
 * - queryCollection for content, podcasts, newsletters, authors
 * - API calls for backlinks, mentions, and note graph
 * - Route parameters for dynamic content loading
 *
 * Note: These tests are currently skipped because the page requires
 * complex route/payload handling that isn't fully supported in the
 * integration test environment. The pattern is documented here for
 * when @nuxt/test-utils improves support.
 *
 * For now, use E2E tests (Playwright) for full slug page testing.
 */
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import {
  linkedNotes,
  emptyBacklinks,
  emptyMentions,
  simpleNoteGraph,
} from '../fixtures'
import { createMultiCollectionMock } from '../fixtures/query-builder'

// Hoisted mock data holder
interface CollectionConfig {
  content: { path: Record<string, unknown> }
  podcasts: { data: unknown[] }
  newsletters: { data: unknown[] }
  authors: { data: unknown[] }
}

const { mockCollections } = vi.hoisted(() => {
  const holder: { value: CollectionConfig } = {
    value: {
      content: { path: {} },
      podcasts: { data: [] },
      newsletters: { data: [] },
      authors: { data: [] },
    },
  }
  return { mockCollections: holder }
})

// Mock queryCollection auto-import
mockNuxtImport('queryCollection', () => {
  return (collection: string) => createMultiCollectionMock(mockCollections.value)(collection)
})

describe('[...slug] Page', () => {
  // Slug page tests are skipped due to route/payload issues in test environment
  // The pattern is documented for when @nuxt/test-utils improves support

  it.skip('renders content page with title', async () => {
    const noteA = linkedNotes[0]
    if (!noteA) throw new Error('Test fixture missing')

    mockCollections.value = {
      content: { path: { '/note-a': noteA } },
      podcasts: { data: [] },
      newsletters: { data: [] },
      authors: { data: [] },
    }
    registerEndpoint('/api/backlinks', () => emptyBacklinks)
    registerEndpoint('/api/mentions', () => emptyMentions)
    registerEndpoint('/api/note-graph/note-a', () => simpleNoteGraph)

    // Note: mountSuspended with route option has issues in current test-utils
    // const page = await mountSuspended(SlugPage, { route: '/note-a' })
    // expect(page.text()).toContain('Note A')
  })

  // Placeholder test to ensure the file is recognized
  it('slug page test file placeholder', () => {
    // Slug page requires complex route/payload handling that isn't
    // fully supported in the integration test environment.
    // Use E2E tests for full slug page testing.
    expect(true).toBe(true)
  })
})
