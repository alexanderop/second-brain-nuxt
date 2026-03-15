import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  getSlug,
  createNode,
  calculateConnectionCounts,
} from '../../../server/utils/graph'
import type { ContentItem, GraphNode, GraphEdge } from '../../../server/utils/graph'

describe('getSlug (property-based)', () => {
  it('property: never starts with / for realistic content paths', () => {
    // Real content paths are like "/my-note" (single leading slash, no slashes in slug)
    const slugChars = fc.array(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
      { minLength: 1, maxLength: 20 },
    ).map(a => a.join(''))
    const realisticPathArb = slugChars.map(s => `/${s}`)
    const contentItemArb: fc.Arbitrary<ContentItem> = fc.record({
      path: fc.option(realisticPathArb, { nil: undefined }),
      stem: fc.option(slugChars, { nil: undefined }),
    })

    fc.assert(
      fc.property(contentItemArb, (item) => {
        const slug = getSlug(item)
        expect(slug.startsWith('/')).toBe(false)
      }),
    )
  })
})

describe('createNode (property-based)', () => {
  const contentItemArb: fc.Arbitrary<ContentItem> = fc.record({
    path: fc.option(fc.string(), { nil: undefined }),
    stem: fc.option(fc.string(), { nil: undefined }),
    title: fc.option(fc.string(), { nil: undefined }),
    type: fc.option(fc.string(), { nil: undefined }),
    tags: fc.option(fc.oneof(
      fc.array(fc.string(), { maxLength: 5 }),
      fc.constant(undefined),
    ), { nil: undefined }),
    authors: fc.option(fc.oneof(
      fc.array(fc.string(), { maxLength: 3 }),
      fc.constant(undefined),
    ), { nil: undefined }),
    summary: fc.option(fc.string(), { nil: undefined }),
  })

  it('property: tags and authors are always arrays', () => {
    fc.assert(
      fc.property(contentItemArb, (item) => {
        const node = createNode(item)
        expect(Array.isArray(node.tags)).toBe(true)
        expect(Array.isArray(node.authors)).toBe(true)
      }),
    )
  })

  it('property: connections is always 0 and isMap matches type === map', () => {
    fc.assert(
      fc.property(contentItemArb, (item) => {
        const node = createNode(item)
        expect(node.connections).toBe(0)
        expect(node.isMap).toBe(item.type === 'map')
      }),
    )
  })

  it('property: createNode(item).id === getSlug(item)', () => {
    fc.assert(
      fc.property(contentItemArb, (item) => {
        expect(createNode(item).id).toBe(getSlug(item))
      }),
    )
  })
})

describe('calculateConnectionCounts (property-based)', () => {
  it('property: sum of connections = 2 * edges.length', () => {
    const nodeIdArb = fc.string({ minLength: 1, maxLength: 10 })
    const nodeIdsArb = fc.uniqueArray(nodeIdArb, { minLength: 1, maxLength: 10 })

    fc.assert(
      fc.property(nodeIdsArb, (nodeIds) => {
        const nodes: GraphNode[] = nodeIds.map(id => ({
          id,
          title: id,
          type: 'note',
          tags: [],
          authors: [],
          connections: 0,
          maps: [],
          isMap: false,
        }))

        const edgesArb = fc.array(
          fc.record({
            source: fc.constantFrom(...nodeIds),
            target: fc.constantFrom(...nodeIds),
          }),
          { maxLength: 15 },
        )

        fc.assert(
          fc.property(edgesArb, (edges) => {
            // Reset connections
            for (const node of nodes) node.connections = 0

            calculateConnectionCounts(nodes, edges)
            const sum = nodes.reduce((acc, n) => acc + n.connections, 0)
            expect(sum).toBe(2 * edges.length)
          }),
        )
      }),
    )
  })

  it('property: nodes not in any edge get connections === 0', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 10 }),
        (nodeIds) => {
          const nodes: GraphNode[] = nodeIds.map(id => ({
            id,
            title: id,
            type: 'note',
            tags: [],
            authors: [],
            connections: 0,
            maps: [],
            isMap: false,
          }))

          // Only use first two nodes for edges, rest should stay at 0
          const connectedIds = nodeIds.slice(0, 2)
          const disconnectedIds = nodeIds.slice(2)
          const first = connectedIds[0]
          const second = connectedIds[1]
          const edges: GraphEdge[] = first !== undefined && second !== undefined
            ? [{ source: first, target: second }]
            : []

          calculateConnectionCounts(nodes, edges)

          for (const node of nodes) {
            if (disconnectedIds.includes(node.id)) {
              expect(node.connections).toBe(0)
            }
          }
        },
      ),
    )
  })
})
