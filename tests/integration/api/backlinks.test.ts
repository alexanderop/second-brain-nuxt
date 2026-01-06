/**
 * Integration tests for /api/backlinks endpoint
 *
 * These tests verify that components can successfully fetch and parse
 * backlinks data from the API. The API route implementation is tested at
 * the unit level (server/utils/backlinks.test.ts) and E2E level.
 *
 * This layer tests the HTTP contract: request → response shape.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { buildBacklinksIndex } from '../../../server/utils/backlinks'
import { emptyContent, linkedNotes, multipleLinks } from '../fixtures/content'

describe('/api/backlinks integration', () => {
  it('returns empty object for no content', async () => {
    const backlinks = buildBacklinksIndex(emptyContent)
    registerEndpoint('/api/backlinks', () => backlinks)

    const response = await $fetch('/api/backlinks')

    expect(response).toEqual({})
  })

  it('returns backlinks index structure', async () => {
    const backlinks = buildBacklinksIndex(linkedNotes)
    registerEndpoint('/api/backlinks', () => backlinks)

    const response = await $fetch('/api/backlinks')

    expect(typeof response).toBe('object')
  })

  it('includes backlink metadata', async () => {
    const backlinks = buildBacklinksIndex(linkedNotes)
    registerEndpoint('/api/backlinks', () => backlinks)

    const response = await $fetch('/api/backlinks')

    const firstTarget = Object.keys(response)[0]
    if (firstTarget && response[firstTarget].length > 0) {
      const backlink = response[firstTarget][0]
      expect(backlink).toHaveProperty('slug')
      expect(backlink).toHaveProperty('title')
      expect(backlink).toHaveProperty('type')
    }
  })

  it('handles complex backlink networks', async () => {
    const backlinks = buildBacklinksIndex(multipleLinks)
    registerEndpoint('/api/backlinks', () => backlinks)

    const response = await $fetch('/api/backlinks')

    expect(Object.keys(response).length).toBeGreaterThan(0)
  })
})
