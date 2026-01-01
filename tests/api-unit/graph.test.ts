import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fixtures,
  createQueryCollectionMock,
  setupGlobalMocks,
  createMockEvent,
} from './setup'

// Setup mocks before importing handler
const queryCollectionMock = createQueryCollectionMock()

vi.mock('@nuxt/content/server', () => ({
  queryCollection: queryCollectionMock.mock,
}))

setupGlobalMocks()

describe('/api/graph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns empty arrays for no content', async () => {
    queryCollectionMock.setData(fixtures.empty)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual({ nodes: [], edges: [] })
  })

  it('creates nodes for each content item', async () => {
    queryCollectionMock.setData(fixtures.simpleNote)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]).toMatchObject({
      id: 'note-a',
      title: 'Note A',
      type: 'note',
      tags: [],
      summary: 'A simple note',
      connections: 0,
    })
  })

  it('creates edges from wiki-links', async () => {
    queryCollectionMock.setData(fixtures.linkedNotes)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual({
      source: 'note-a',
      target: 'note-b',
    })
  })

  it('calculates connection counts correctly for single link', async () => {
    queryCollectionMock.setData(fixtures.linkedNotes)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    const noteA = result.nodes.find(n => n.id === 'note-a')
    const noteB = result.nodes.find(n => n.id === 'note-b')

    expect(noteA?.connections).toBe(1) // outgoing link to B
    expect(noteB?.connections).toBe(1) // incoming link from A
  })

  it('handles multiple links and bidirectional connections', async () => {
    queryCollectionMock.setData(fixtures.multipleLinks)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(3) // A->B, A->C, B->A

    const atomicHabits = result.nodes.find(n => n.id === 'atomic-habits')
    const deepWork = result.nodes.find(n => n.id === 'deep-work')
    const thinking = result.nodes.find(n => n.id === 'thinking-fast-and-slow')

    // atomic-habits: links to 2 (deep-work, thinking) + 1 incoming (from deep-work) = 3
    expect(atomicHabits?.connections).toBe(3)
    // deep-work: links to 1 (atomic-habits) + 1 incoming (from atomic-habits) = 2
    expect(deepWork?.connections).toBe(2)
    // thinking: 0 outgoing + 1 incoming (from atomic-habits) = 1
    expect(thinking?.connections).toBe(1)
  })

  it('only creates edges to existing nodes', async () => {
    const contentWithDeadLink = [
      {
        path: '/note-a',
        stem: 'note-a',
        title: 'Note A',
        type: 'note',
        tags: [],
        body: {
          type: 'minimark',
          value: [
            ['p', {}, ['a', { href: '/non-existent' }, 'Dead link']],
          ],
        },
      },
    ]
    queryCollectionMock.setData(contentWithDeadLink)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(0) // No edge to non-existent node
  })

  it('avoids self-referential edges', async () => {
    const contentWithSelfLink = [
      {
        path: '/note-a',
        stem: 'note-a',
        title: 'Note A',
        type: 'note',
        tags: [],
        body: {
          type: 'minimark',
          value: [
            ['p', {}, ['a', { href: '/note-a' }, 'Self link']],
          ],
        },
      },
    ]
    queryCollectionMock.setData(contentWithSelfLink)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result.edges).toHaveLength(0)
  })

  it('handles errors gracefully', async () => {
    queryCollectionMock.mock.mockImplementationOnce(() => {
      throw new Error('Database error')
    })

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual({ nodes: [], edges: [] })
  })

  it('preserves all node properties', async () => {
    queryCollectionMock.setData(fixtures.multipleLinks)

    const { default: handler } = await import('../../server/api/graph.get')
    const result = await handler(createMockEvent())

    const atomicHabits = result.nodes.find(n => n.id === 'atomic-habits')
    expect(atomicHabits).toMatchObject({
      id: 'atomic-habits',
      title: 'Atomic Habits',
      type: 'book',
      tags: ['productivity', 'habits'],
      summary: 'Build better habits',
    })
  })
})
