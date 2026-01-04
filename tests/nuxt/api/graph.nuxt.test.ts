import { describe, expect, it } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('/api/graph', () => {
  it('returns nodes and edges arrays', async () => {
    const result = await $fetch('/api/graph')

    expect(result).toHaveProperty('nodes')
    expect(result).toHaveProperty('edges')
    expect(Array.isArray(result.nodes)).toBe(true)
    expect(Array.isArray(result.edges)).toBe(true)
  })

  it('nodes have required properties', async () => {
    const result = await $fetch('/api/graph')

    if (result.nodes.length > 0) {
      const node = result.nodes[0]
      expect(node).toHaveProperty('id')
      expect(node).toHaveProperty('title')
      expect(node).toHaveProperty('type')
      expect(node).toHaveProperty('tags')
      expect(node).toHaveProperty('connections')
      expect(typeof node?.id).toBe('string')
      expect(typeof node?.title).toBe('string')
      expect(typeof node?.type).toBe('string')
      expect(Array.isArray(node?.tags)).toBe(true)
      expect(typeof node?.connections).toBe('number')
    }
  })

  it('edges reference existing nodes', async () => {
    const result = await $fetch('/api/graph')
    const nodeIds = new Set(result.nodes.map((n: { id: string }) => n.id))

    for (const edge of result.edges) {
      expect(nodeIds.has(edge.source)).toBe(true)
      expect(nodeIds.has(edge.target)).toBe(true)
    }
  })

  it('edges have source and target properties', async () => {
    const result = await $fetch('/api/graph')

    if (result.edges.length > 0) {
      const edge = result.edges[0]
      expect(edge).toHaveProperty('source')
      expect(edge).toHaveProperty('target')
      expect(typeof edge?.source).toBe('string')
      expect(typeof edge?.target).toBe('string')
    }
  })

  it('connection counts are consistent with edges', async () => {
    const result = await $fetch('/api/graph')

    // Build connection counts from edges
    const connectionCounts = new Map<string, number>()
    for (const node of result.nodes) {
      connectionCounts.set(node.id, 0)
    }
    for (const edge of result.edges) {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1)
      connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1)
    }

    // Verify each node's connection count matches
    for (const node of result.nodes) {
      expect(node.connections).toBe(connectionCounts.get(node.id))
    }
  })
})
