/**
 * Integration tests for /api/raw-content/[slug] endpoint
 *
 * These tests verify that components can fetch raw markdown content
 * by mocking the API response with registerEndpoint.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { simpleRawContent, minimalRawContent, createRawContentResponse } from '../fixtures'

describe('/api/raw-content/[slug] integration', () => {
  it('can register raw content endpoint', async () => {
    registerEndpoint('/api/raw-content/atomic-habits', () => simpleRawContent)

    const response = await $fetch('/api/raw-content/atomic-habits')
    expect(response.raw).toContain('# Atomic Habits')
  })

  it('raw content includes frontmatter', async () => {
    registerEndpoint('/api/raw-content/atomic-habits', () => simpleRawContent)

    const response = await $fetch('/api/raw-content/atomic-habits')
    expect(response.raw).toContain('title: Atomic Habits')
    expect(response.raw).toContain('type: book')
  })

  it('raw content includes wiki-links', async () => {
    registerEndpoint('/api/raw-content/atomic-habits', () => simpleRawContent)

    const response = await $fetch('/api/raw-content/atomic-habits')
    expect(response.raw).toContain('[[deep-work]]')
    expect(response.raw).toContain('[[thinking-fast-and-slow]]')
  })

  it('can register minimal raw content', async () => {
    registerEndpoint('/api/raw-content/simple-note', () => minimalRawContent)

    const response = await $fetch('/api/raw-content/simple-note')
    expect(response.raw).toContain('title: Simple Note')
    expect(response.raw).toContain('Just a simple note.')
  })

  it('can use factory for custom raw content', async () => {
    const customContent = createRawContentResponse('# Custom Note\n\nCustom content here.')
    registerEndpoint('/api/raw-content/custom', () => customContent)

    const response = await $fetch('/api/raw-content/custom')
    expect(response.raw).toBe('# Custom Note\n\nCustom content here.')
  })
})
