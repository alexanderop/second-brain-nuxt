/**
 * Graph response fixtures for integration tests
 *
 * Note: These fixtures use string literals for types rather than ContentType
 * because we're testing API responses where types come as strings from the server.
 */

export interface GraphFixtureNode {
  id: string
  title: string
  type: string
  tags: string[]
  authors: string[]
  connections: number
}

export interface GraphFixtureEdge {
  source: string
  target: string
}

export interface GraphFixture {
  nodes: GraphFixtureNode[]
  edges: GraphFixtureEdge[]
}

export const emptyGraph: GraphFixture = {
  nodes: [],
  edges: [],
}

export const simpleGraph: GraphFixture = {
  nodes: [
    { id: 'note-a', title: 'Note A', type: 'note', tags: [], authors: [], connections: 0 },
  ],
  edges: [],
}

export const linkedGraph: GraphFixture = {
  nodes: [
    { id: 'note-a', title: 'Note A', type: 'note', tags: ['tag1'], authors: [], connections: 1 },
    { id: 'note-b', title: 'Note B', type: 'article', tags: ['tag2'], authors: [], connections: 1 },
  ],
  edges: [
    { source: 'note-a', target: 'note-b' },
  ],
}

export const multiLinkGraph: GraphFixture = {
  nodes: [
    { id: 'atomic-habits', title: 'Atomic Habits', type: 'book', tags: ['productivity', 'habits'], authors: [], connections: 3 },
    { id: 'deep-work', title: 'Deep Work', type: 'book', tags: ['productivity', 'focus'], authors: [], connections: 2 },
    { id: 'thinking-fast-and-slow', title: 'Thinking Fast and Slow', type: 'book', tags: ['psychology'], authors: [], connections: 1 },
  ],
  edges: [
    { source: 'atomic-habits', target: 'deep-work' },
    { source: 'atomic-habits', target: 'thinking-fast-and-slow' },
    { source: 'deep-work', target: 'atomic-habits' },
  ],
}

// Factory for creating custom graph responses
export function createGraphResponse(
  nodes: Partial<GraphFixtureNode>[] = [],
  edges: GraphFixtureEdge[] = [],
): GraphFixture {
  return {
    nodes: nodes.map((n, i) => ({
      id: n.id ?? `node-${i}`,
      title: n.title ?? `Node ${i}`,
      type: n.type ?? 'note',
      tags: n.tags ?? [],
      authors: n.authors ?? [],
      connections: n.connections ?? 0,
    })),
    edges,
  }
}
