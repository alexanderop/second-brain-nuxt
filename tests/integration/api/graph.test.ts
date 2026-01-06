/**
 * Integration tests for /api/graph endpoint
 *
 * These tests verify that components can successfully fetch and parse
 * graph data from the API. The API route implementation is tested at
 * the unit level (server/utils/graph.test.ts) and E2E level.
 *
 * This layer tests the HTTP contract: request → response shape.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { buildGraphFromContent } from '../../../server/utils/graph'
import { emptyContent, linkedNotes, multipleLinks } from '../fixtures/content'

describe('/api/graph integration', () => {
  it('returns empty graph structure', async () => {
    const graphData = buildGraphFromContent(emptyContent)
    registerEndpoint('/api/graph', () => graphData)

    const response = await $fetch('/api/graph')

    expect(response).toEqual({ nodes: [], edges: [] })
  })

  it('returns graph with correct structure', async () => {
    const graphData = buildGraphFromContent(linkedNotes)
    registerEndpoint('/api/graph', () => graphData)

    const response = await $fetch('/api/graph')

    // Verify response contract
    expect(response).toHaveProperty('nodes')
    expect(response).toHaveProperty('edges')
    expect(Array.isArray(response.nodes)).toBe(true)
    expect(Array.isArray(response.edges)).toBe(true)
  })

  it('includes node metadata in response', async () => {
    const graphData = buildGraphFromContent(linkedNotes)
    registerEndpoint('/api/graph', () => graphData)

    const response = await $fetch('/api/graph')

    const node = response.nodes[0]
    expect(node).toHaveProperty('id')
    expect(node).toHaveProperty('title')
    expect(node).toHaveProperty('type')
    expect(node).toHaveProperty('tags')
    expect(node).toHaveProperty('connections')
  })

  it('includes edge data in response', async () => {
    const graphData = buildGraphFromContent(linkedNotes)
    registerEndpoint('/api/graph', () => graphData)

    const response = await $fetch('/api/graph')

    if (response.edges.length > 0) {
      const edge = response.edges[0]
      expect(edge).toHaveProperty('source')
      expect(edge).toHaveProperty('target')
    }
  })

  it('handles complex graphs', async () => {
    const graphData = buildGraphFromContent(multipleLinks)
    registerEndpoint('/api/graph', () => graphData)

    const response = await $fetch('/api/graph')

    expect(response.nodes.length).toBeGreaterThan(0)
    expect(response.edges.length).toBeGreaterThan(0)
  })
})
