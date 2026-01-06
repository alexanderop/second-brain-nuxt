/**
 * Integration tests for /api/backlinks endpoint
 *
 * These tests verify that components can fetch and use backlinks data
 * by mocking the API response with registerEndpoint.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { emptyBacklinks, simpleBacklinks, bidirectionalBacklinks, hubBacklinks } from '../fixtures'

describe('/api/backlinks integration', () => {
  it('can register empty backlinks endpoint', async () => {
    registerEndpoint('/api/backlinks', () => emptyBacklinks)

    const response = await $fetch('/api/backlinks')
    expect(response).toEqual({})
  })

  it('can register backlinks with single target', async () => {
    registerEndpoint('/api/backlinks', () => simpleBacklinks)

    const response = await $fetch('/api/backlinks')
    expect(response['note-b']).toHaveLength(1)
    expect(response['note-b'][0].slug).toBe('note-a')
  })

  it('can register bidirectional backlinks', async () => {
    registerEndpoint('/api/backlinks', () => bidirectionalBacklinks)

    const response = await $fetch('/api/backlinks')
    expect(response['deep-work']).toBeDefined()
    expect(response['atomic-habits']).toBeDefined()
  })

  it('can register hub with multiple incoming links', async () => {
    registerEndpoint('/api/backlinks', () => hubBacklinks)

    const response = await $fetch('/api/backlinks')
    expect(response['productivity-hub']).toHaveLength(3)
  })
})
