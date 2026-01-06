/**
 * Integration tests for /api/graph endpoint
 *
 * These tests verify that components can fetch and use graph data
 * by mocking the API response with registerEndpoint.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { emptyGraph, linkedGraph, multiLinkGraph } from '../fixtures'

describe('/api/graph integration', () => {
  it('can register empty graph endpoint', async () => {
    registerEndpoint('/api/graph', () => emptyGraph)

    const response = await $fetch('/api/graph')
    expect(response).toEqual({ nodes: [], edges: [] })
  })

  it('can register graph with nodes and edges', async () => {
    registerEndpoint('/api/graph', () => linkedGraph)

    const response = await $fetch('/api/graph')
    expect(response.nodes).toHaveLength(2)
    expect(response.edges).toHaveLength(1)
  })

  it('can register complex graph', async () => {
    registerEndpoint('/api/graph', () => multiLinkGraph)

    const response = await $fetch('/api/graph')
    expect(response.nodes).toHaveLength(3)
    expect(response.edges).toHaveLength(3)
  })
})
