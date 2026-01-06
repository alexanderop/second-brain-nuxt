/**
 * Integration tests for /api/mentions endpoint
 *
 * These tests verify that components can fetch unlinked mentions
 * by mocking the API response with registerEndpoint.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { emptyMentions, singleMention, multipleMentions } from '../fixtures'

describe('/api/mentions integration', () => {
  it('can register empty mentions endpoint', async () => {
    registerEndpoint('/api/mentions', () => emptyMentions)

    const response = await $fetch('/api/mentions?slug=test&title=Test')
    expect(response).toEqual([])
  })

  it('can register single mention', async () => {
    registerEndpoint('/api/mentions', () => singleMention)

    const response = await $fetch('/api/mentions?slug=atomic-habits&title=Atomic Habits')
    expect(response).toHaveLength(1)
    expect(response[0].slug).toBe('article-three')
  })

  it('can register multiple mentions', async () => {
    registerEndpoint('/api/mentions', () => multipleMentions)

    const response = await $fetch('/api/mentions?slug=atomic-habits&title=Atomic Habits')
    expect(response).toHaveLength(2)
  })

  it('includes highlighted snippets in response', async () => {
    registerEndpoint('/api/mentions', () => singleMention)

    const response = await $fetch('/api/mentions?slug=atomic-habits&title=Atomic Habits')
    expect(response[0].highlightedSnippet).toContain('<mark>')
  })
})
