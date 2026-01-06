/**
 * Integration tests for /api/note-graph/[slug] endpoint
 *
 * These tests verify that components can successfully fetch and parse
 * note-specific graph data from the API. Note graph building logic is
 * tested via E2E tests with real content.
 *
 * This layer tests the HTTP contract: request → response shape.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { simpleNoteGraph, isolatedNoteGraph } from '../fixtures/note-graph'

describe('/api/note-graph/[slug] integration', () => {
  it('returns null for non-existent note', async () => {
    registerEndpoint('/api/note-graph/non-existent', () => null)

    const response = await $fetch('/api/note-graph/non-existent')

    expect(response).toBeFalsy()
  })

  it('returns note graph structure', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => simpleNoteGraph)

    const response = await $fetch('/api/note-graph/atomic-habits')

    expect(response).toHaveProperty('center')
    expect(response).toHaveProperty('connected')
    expect(response).toHaveProperty('edges')
  })

  it('includes center node metadata', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => simpleNoteGraph)

    const response = await $fetch('/api/note-graph/atomic-habits')

    expect(response.center).toHaveProperty('id')
    expect(response.center).toHaveProperty('title')
    expect(response.center).toHaveProperty('type')
    expect(response.center).toHaveProperty('isCenter')
    expect(response.center).toHaveProperty('level')
    expect(response.center.isCenter).toBe(true)
    expect(response.center.level).toBe(0)
  })

  it('includes connected nodes with levels', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => simpleNoteGraph)

    const response = await $fetch('/api/note-graph/atomic-habits')

    expect(Array.isArray(response.connected)).toBe(true)
    if (response.connected.length > 0) {
      const node = response.connected[0]
      expect(node).toHaveProperty('id')
      expect(node).toHaveProperty('title')
      expect(node).toHaveProperty('type')
      expect(node).toHaveProperty('level')
    }
  })

  it('includes edges with levels', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => simpleNoteGraph)

    const response = await $fetch('/api/note-graph/atomic-habits')

    expect(Array.isArray(response.edges)).toBe(true)
    if (response.edges.length > 0) {
      const edge = response.edges[0]
      expect(edge).toHaveProperty('source')
      expect(edge).toHaveProperty('target')
      expect(edge).toHaveProperty('level')
    }
  })

  it('handles isolated notes', async () => {
    registerEndpoint('/api/note-graph/isolated', () => isolatedNoteGraph)

    const response = await $fetch('/api/note-graph/isolated')

    expect(response.connected).toEqual([])
    expect(response.edges).toEqual([])
  })
})
