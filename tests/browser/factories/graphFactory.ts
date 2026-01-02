import type { NoteGraphData, FullGraphData, FullGraphNode } from '~/types/graph'

/**
 * Factory for creating NoteGraphData (radial mode - center-focused)
 */
export function createNoteGraphData(overrides: Partial<NoteGraphData> = {}): NoteGraphData {
  return {
    center: { id: 'center-note', title: 'Center Note', type: 'note' },
    connected: [
      { id: 'note-1', title: 'Connected Article', type: 'article', level: 1 },
      { id: 'note-2', title: 'Connected Book', type: 'book', level: 1 },
    ],
    edges: [
      { source: 'center-note', target: 'note-1', level: 1 },
      { source: 'center-note', target: 'note-2', level: 1 },
    ],
    ...overrides,
  }
}

/**
 * Factory for creating FullGraphData (freeform mode - flat nodes)
 */
export function createFullGraphData(overrides: Partial<FullGraphData> = {}): FullGraphData {
  const defaultNodes: FullGraphNode[] = [
    { id: 'node-1', title: 'Node 1', type: 'note', tags: [], authors: [], connections: 5 },
    { id: 'node-2', title: 'Node 2', type: 'article', tags: [], authors: [], connections: 3 },
    { id: 'node-3', title: 'Map Node', type: 'map', tags: [], authors: [], connections: 8, isMap: true },
  ]

  return {
    nodes: defaultNodes,
    edges: [
      { source: 'node-1', target: 'node-2' },
      { source: 'node-1', target: 'node-3' },
    ],
    ...overrides,
  }
}

/**
 * Factory for creating empty graph data (no connections)
 */
export function createEmptyNoteGraphData(): NoteGraphData {
  return {
    center: { id: 'empty', title: 'Empty Note', type: 'note' },
    connected: [],
    edges: [],
  }
}

/**
 * Factory for creating a larger graph with level 2 connections
 */
export function createNoteGraphDataWithLevel2(): NoteGraphData {
  return {
    center: { id: 'center', title: 'Center', type: 'note' },
    connected: [
      { id: 'l1-1', title: 'Level 1 - A', type: 'article', level: 1 },
      { id: 'l1-2', title: 'Level 1 - B', type: 'book', level: 1 },
      { id: 'l2-1', title: 'Level 2 - A', type: 'podcast', level: 2 },
      { id: 'l2-2', title: 'Level 2 - B', type: 'youtube', level: 2 },
    ],
    edges: [
      { source: 'center', target: 'l1-1', level: 1 },
      { source: 'center', target: 'l1-2', level: 1 },
      { source: 'l1-1', target: 'l2-1', level: 2 },
      { source: 'l1-2', target: 'l2-2', level: 2 },
    ],
  }
}
