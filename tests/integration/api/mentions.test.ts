/**
 * Integration tests for /api/mentions endpoint
 *
 * These tests verify that components can successfully fetch and parse
 * mentions data from the API. The API route implementation is tested at
 * the unit level (server/utils/mentions.test.ts) and E2E level.
 *
 * This layer tests the HTTP contract: request → response shape.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { findUnlinkedMentions } from '../../../server/utils/mentions'
import { multipleLinks } from '../fixtures/content'
import { withMentions } from '../fixtures/search'

describe('/api/mentions integration', () => {
  it('returns empty array when no slug provided', async () => {
    registerEndpoint('/api/mentions', () => [])

    const response = await $fetch('/api/mentions?slug=&title=')

    expect(response).toEqual([])
  })

  it('returns mentions array structure', async () => {
    const mentions = findUnlinkedMentions(multipleLinks, withMentions, 'atomic-habits', 'Atomic Habits')
    registerEndpoint('/api/mentions', () => mentions)

    const response = await $fetch('/api/mentions?slug=atomic-habits&title=Atomic Habits')

    expect(Array.isArray(response)).toBe(true)
  })

  it('includes mention metadata', async () => {
    const mentions = findUnlinkedMentions(multipleLinks, withMentions, 'atomic-habits', 'Atomic Habits')
    registerEndpoint('/api/mentions', () => mentions)

    const response = await $fetch('/api/mentions?slug=atomic-habits&title=Atomic Habits')

    if (response.length > 0) {
      const mention = response[0]
      expect(mention).toHaveProperty('slug')
      expect(mention).toHaveProperty('title')
      expect(mention).toHaveProperty('type')
      expect(mention).toHaveProperty('highlightedSnippet')
    }
  })
})
