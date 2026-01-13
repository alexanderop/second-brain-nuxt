import { describe, it, expect } from 'vitest'
import {
  getSlug,
  createNode,
  extractEdges,
  calculateConnectionCounts,
  computeMapMembership,
  buildGraphFromContent,
  type ContentItem,
  type GraphNode,
  type GraphEdge,
} from '../../../server/utils/graph'

// Test fixtures with proper typing
const fixtures: Record<string, ContentItem[]> = {
  empty: [],

  simpleNote: [
    {
      path: '/note-a',
      stem: 'note-a',
      title: 'Note A',
      type: 'note',
      tags: [],
      summary: 'A simple note',
      body: { type: 'minimark', value: [] },
    },
  ],

  linkedNotes: [
    {
      path: '/note-a',
      stem: 'note-a',
      title: 'Note A',
      type: 'note',
      tags: ['tag1'],
      summary: 'First note',
      body: {
        type: 'minimark',
        value: [
          ['p', {}, 'Text with ', ['a', { href: '/note-b' }, 'link to B']],
        ],
      },
    },
    {
      path: '/note-b',
      stem: 'note-b',
      title: 'Note B',
      type: 'article',
      tags: ['tag2'],
      summary: 'Second note',
      body: { type: 'minimark', value: [] },
    },
  ],

  multipleLinks: [
    {
      path: '/atomic-habits',
      stem: 'atomic-habits',
      title: 'Atomic Habits',
      type: 'book',
      tags: ['productivity', 'habits'],
      summary: 'Build better habits',
      body: {
        type: 'minimark',
        value: [
          ['p', {}, 'Links to ', ['a', { href: '/deep-work' }, 'Deep Work'], ' and ', ['a', { href: '/thinking-fast-and-slow' }, 'Thinking Fast']],
        ],
      },
    },
    {
      path: '/deep-work',
      stem: 'deep-work',
      title: 'Deep Work',
      type: 'book',
      tags: ['productivity', 'focus'],
      summary: 'Focus without distraction',
      body: {
        type: 'minimark',
        value: [
          ['p', {}, 'References ', ['a', { href: '/atomic-habits' }, 'Atomic Habits']],
        ],
      },
    },
    {
      path: '/thinking-fast-and-slow',
      stem: 'thinking-fast-and-slow',
      title: 'Thinking Fast and Slow',
      type: 'book',
      tags: ['psychology'],
      summary: 'Two systems of thinking',
      body: { type: 'minimark', value: [] },
    },
  ],
}

describe('server/utils/graph', () => {
  describe('getSlug', () => {
    it('extracts slug from path', () => {
      expect(getSlug({ path: '/note-a' })).toBe('note-a')
    })

    it('falls back to stem if no path', () => {
      expect(getSlug({ stem: 'note-a' })).toBe('note-a')
    })

    it('returns empty string if no path or stem', () => {
      expect(getSlug({})).toBe('')
    })
  })

  describe('createNode', () => {
    it('creates node with all properties', () => {
      const item = fixtures.simpleNote[0]
      const node = createNode(item)

      expect(node).toMatchObject({
        id: 'note-a',
        title: 'Note A',
        type: 'note',
        tags: [],
        summary: 'A simple note',
        connections: 0,
        maps: [],
        isMap: false,
      })
    })

    it('marks map type correctly', () => {
      const item: ContentItem = { path: '/my-map', type: 'map', title: 'My Map' }
      const node = createNode(item)

      expect(node.isMap).toBe(true)
    })

    it('defaults to note type', () => {
      const item: ContentItem = { path: '/untitled' }
      const node = createNode(item)

      expect(node.type).toBe('note')
    })

    it('defaults authors to empty array when not an array', () => {
      // @ts-expect-error Testing invalid input: authors should be array
      const item: ContentItem = { path: '/test', authors: 'not-an-array' }
      const node = createNode(item)

      expect(node.authors).toEqual([])
    })

    it('defaults authors to empty array when undefined', () => {
      const item: ContentItem = { path: '/test' }
      const node = createNode(item)

      expect(node.authors).toEqual([])
    })

    it('defaults tags to empty array when not an array', () => {
      // @ts-expect-error Testing invalid input: tags should be array
      const item: ContentItem = { path: '/test', tags: 'not-an-array' }
      const node = createNode(item)

      expect(node.tags).toEqual([])
    })

    it('defaults tags to empty array when undefined', () => {
      const item: ContentItem = { path: '/test' }
      const node = createNode(item)

      expect(node.tags).toEqual([])
    })

    it('preserves authors array when provided', () => {
      const item: ContentItem = { path: '/test', authors: ['author-1', 'author-2'] }
      const node = createNode(item)

      expect(node.authors).toEqual(['author-1', 'author-2'])
    })

    it('preserves tags array when provided', () => {
      const item: ContentItem = { path: '/test', tags: ['tag-1', 'tag-2'] }
      const node = createNode(item)

      expect(node.tags).toEqual(['tag-1', 'tag-2'])
    })
  })

  describe('extractEdges', () => {
    it('extracts edges to existing nodes', () => {
      const item = fixtures.linkedNotes[0]
      const existingNodes = new Set(['note-a', 'note-b'])
      const edges = extractEdges(item, existingNodes)

      expect(edges).toEqual([{ source: 'note-a', target: 'note-b' }])
    })

    it('ignores links to non-existent nodes', () => {
      const item = fixtures.linkedNotes[0]
      const existingNodes = new Set(['note-a']) // note-b doesn't exist
      const edges = extractEdges(item, existingNodes)

      expect(edges).toEqual([])
    })

    it('ignores self-referential links', () => {
      const item: ContentItem = {
        path: '/note-a',
        body: {
          type: 'minimark',
          value: [['p', {}, ['a', { href: '/note-a' }, 'self link']]],
        },
      }
      const existingNodes = new Set(['note-a'])
      const edges = extractEdges(item, existingNodes)

      expect(edges).toEqual([])
    })
  })

  describe('calculateConnectionCounts', () => {
    it('counts connections correctly', () => {
      const nodes: GraphNode[] = [
        { id: 'a', title: 'A', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
        { id: 'b', title: 'B', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
      ]
      const edges = [{ source: 'a', target: 'b' }]

      calculateConnectionCounts(nodes, edges)

      expect(nodes[0].connections).toBe(1) // a has outgoing link
      expect(nodes[1].connections).toBe(1) // b has incoming link
    })

    it('handles multiple edges', () => {
      const nodes: GraphNode[] = [
        { id: 'a', title: 'A', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
        { id: 'b', title: 'B', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
        { id: 'c', title: 'C', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
      ]
      const edges = [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'a' },
      ]

      calculateConnectionCounts(nodes, edges)

      expect(nodes[0].connections).toBe(3) // 2 outgoing + 1 incoming
      expect(nodes[1].connections).toBe(2) // 1 incoming + 1 outgoing
      expect(nodes[2].connections).toBe(1) // 1 incoming
    })

    it('returns 0 connections for isolated node', () => {
      const nodes: GraphNode[] = [
        { id: 'orphan', title: 'Orphan', type: 'note', tags: [], authors: [], connections: 5, maps: [], isMap: false },
      ]
      const edges: GraphEdge[] = []

      calculateConnectionCounts(nodes, edges)

      expect(nodes[0].connections).toBe(0) // Must be reset to 0
    })

    it('resets existing connection counts to 0 for all nodes', () => {
      // Nodes with pre-existing connection counts should be reset
      const nodes: GraphNode[] = [
        { id: 'a', title: 'A', type: 'note', tags: [], authors: [], connections: 999, maps: [], isMap: false },
        { id: 'b', title: 'B', type: 'note', tags: [], authors: [], connections: 888, maps: [], isMap: false },
      ]
      const edges: GraphEdge[] = [] // No edges

      calculateConnectionCounts(nodes, edges)

      // Both must be reset to 0 (not stay at 999 and 888)
      expect(nodes[0].connections).toBe(0)
      expect(nodes[1].connections).toBe(0)
    })
  })

  describe('computeMapMembership', () => {
    it('tracks which maps contain which nodes', () => {
      const mapContent: ContentItem[] = [
        {
          path: '/my-map',
          type: 'map',
          body: {
            type: 'minimark',
            value: [['p', {}, ['a', { href: '/note-a' }, 'Note A']]],
          },
        },
        { path: '/note-a', type: 'note', body: { type: 'minimark', value: [] } },
      ]

      const nodes: GraphNode[] = [
        { id: 'my-map', title: 'My Map', type: 'map', tags: [], authors: [], connections: 0, maps: [], isMap: true },
        { id: 'note-a', title: 'Note A', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
      ]
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      computeMapMembership(mapContent, nodeMap)

      expect(nodes[1].maps).toEqual(['my-map'])
    })

    it('only processes map items for membership', () => {
      const content: ContentItem[] = [
        { path: '/note-a', type: 'note', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/note-b' }, 'B']]] } },
        { path: '/note-b', type: 'note', body: { type: 'minimark', value: [] } },
      ]
      const nodes: GraphNode[] = [
        { id: 'note-a', title: 'A', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
        { id: 'note-b', title: 'B', type: 'note', tags: [], authors: [], connections: 0, maps: [], isMap: false },
      ]
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      computeMapMembership(content, nodeMap)

      // note-b should NOT have note-a as a map (note-a is not type: 'map')
      expect(nodes[1].maps).toEqual([])
    })

    it('prevents map from adding itself to its own maps', () => {
      const content: ContentItem[] = [
        { path: '/my-map', type: 'map', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/my-map' }, 'Self']]] } },
      ]
      const nodes: GraphNode[] = [
        { id: 'my-map', title: 'My Map', type: 'map', tags: [], authors: [], connections: 0, maps: [], isMap: true },
      ]
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      computeMapMembership(content, nodeMap)

      expect(nodes[0].maps).toEqual([]) // Should not contain itself
    })

    it('ignores links to non-existent nodes in map', () => {
      const content: ContentItem[] = [
        { path: '/my-map', type: 'map', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/ghost' }, 'Ghost']]] } },
      ]
      const nodes: GraphNode[] = [
        { id: 'my-map', title: 'My Map', type: 'map', tags: [], authors: [], connections: 0, maps: [], isMap: true },
      ]
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      computeMapMembership(content, nodeMap)

      // Should not crash, maps stays empty
      expect(nodes[0].maps).toEqual([])
    })
  })

  describe('buildGraphFromContent', () => {
    it('returns empty arrays for no content', () => {
      const result = buildGraphFromContent(fixtures.empty)

      expect(result).toEqual({ nodes: [], edges: [] })
    })

    it('creates nodes for each content item', () => {
      const result = buildGraphFromContent(fixtures.simpleNote)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0]).toMatchObject({
        id: 'note-a',
        title: 'Note A',
        type: 'note',
        connections: 0,
      })
    })

    it('creates edges from wiki-links', () => {
      const result = buildGraphFromContent(fixtures.linkedNotes)

      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0]).toEqual({
        source: 'note-a',
        target: 'note-b',
      })
    })

    it('calculates connection counts correctly', () => {
      const result = buildGraphFromContent(fixtures.linkedNotes)

      const noteA = result.nodes.find(n => n.id === 'note-a')
      const noteB = result.nodes.find(n => n.id === 'note-b')

      expect(noteA?.connections).toBe(1)
      expect(noteB?.connections).toBe(1)
    })

    it('handles multiple links and bidirectional connections', () => {
      const result = buildGraphFromContent(fixtures.multipleLinks)

      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(3)

      const atomicHabits = result.nodes.find(n => n.id === 'atomic-habits')
      const deepWork = result.nodes.find(n => n.id === 'deep-work')
      const thinking = result.nodes.find(n => n.id === 'thinking-fast-and-slow')

      expect(atomicHabits?.connections).toBe(3)
      expect(deepWork?.connections).toBe(2)
      expect(thinking?.connections).toBe(1)
    })

    it('preserves all node properties', () => {
      const result = buildGraphFromContent(fixtures.multipleLinks)

      const atomicHabits = result.nodes.find(n => n.id === 'atomic-habits')
      expect(atomicHabits).toMatchObject({
        id: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
        tags: ['productivity', 'habits'],
        summary: 'Build better habits',
      })
    })

    it('correctly uses nodeMap for map membership lookups', () => {
      const content: ContentItem[] = [
        { path: '/map-one', type: 'map', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/note-a' }, 'A']]] } },
        { path: '/map-two', type: 'map', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/note-a' }, 'A']]] } },
        { path: '/note-a', type: 'note', body: { type: 'minimark', value: [] } },
      ]

      const result = buildGraphFromContent(content)
      const noteA = result.nodes.find(n => n.id === 'note-a')

      expect(noteA?.maps).toContain('map-one')
      expect(noteA?.maps).toContain('map-two')
      expect(noteA?.maps).toHaveLength(2)
    })
  })
})
