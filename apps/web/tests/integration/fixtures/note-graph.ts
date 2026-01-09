/**
 * Note graph response fixtures for integration tests
 *
 * Note: These fixtures match the NoteGraphData type from server/api/note-graph/[slug].get.ts
 */

export interface NoteGraphNodeFixture {
  id: string
  title: string
  type: string
  isCenter?: boolean
  level?: 0 | 1 | 2
}

export interface NoteGraphEdgeFixture {
  source: string
  target: string
  level?: 1 | 2
}

export interface NoteGraphDataFixture {
  center: NoteGraphNodeFixture
  connected: NoteGraphNodeFixture[]
  edges: NoteGraphEdgeFixture[]
}

export const isolatedNoteGraph: NoteGraphDataFixture = {
  center: { id: 'isolated-note', title: 'Isolated Note', type: 'note', isCenter: true, level: 0 },
  connected: [],
  edges: [],
}

export const simpleNoteGraph: NoteGraphDataFixture = {
  center: { id: 'atomic-habits', title: 'Atomic Habits', type: 'book', isCenter: true, level: 0 },
  connected: [
    { id: 'deep-work', title: 'Deep Work', type: 'book', level: 1 },
    { id: 'thinking-fast-and-slow', title: 'Thinking Fast and Slow', type: 'book', level: 1 },
  ],
  edges: [
    { source: 'atomic-habits', target: 'deep-work', level: 1 },
    { source: 'atomic-habits', target: 'thinking-fast-and-slow', level: 1 },
  ],
}

export const noteGraphWithL2: NoteGraphDataFixture = {
  center: { id: 'atomic-habits', title: 'Atomic Habits', type: 'book', isCenter: true, level: 0 },
  connected: [
    { id: 'deep-work', title: 'Deep Work', type: 'book', level: 1 },
    { id: 'focus-article', title: 'On Focus', type: 'article', level: 2 },
  ],
  edges: [
    { source: 'atomic-habits', target: 'deep-work', level: 1 },
    { source: 'deep-work', target: 'focus-article', level: 2 },
  ],
}

export const nullNoteGraph = null

export function createNoteGraphResponse(
  center: { id: string, title: string, type: string },
  connections: Array<{ id: string, title: string, type: string, level: 1 | 2 }> = [],
): NoteGraphDataFixture {
  return {
    center: { ...center, isCenter: true, level: 0 },
    connected: connections.map(c => ({ id: c.id, title: c.title, type: c.type, level: c.level })),
    edges: connections.map(c => ({ source: center.id, target: c.id, level: c.level })),
  }
}
