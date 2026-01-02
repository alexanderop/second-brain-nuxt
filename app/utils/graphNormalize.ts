import type {
  NoteGraphData,
  FullGraphData,
  UnifiedGraphData,
  UnifiedGraphNode,
} from '~/types/graph'

/**
 * Normalize NoteGraph format to unified format
 */
export function normalizeNoteGraphData(data: NoteGraphData): UnifiedGraphData {
  const nodes: UnifiedGraphNode[] = [
    {
      ...data.center,
      isCenter: true,
      level: 0,
      connections: data.connected.filter(n => n.level === 1).length,
    },
    ...data.connected.map(node => ({
      ...node,
      isCenter: false,
      level: node.level ?? 1,
      connections: 0,
    })),
  ]

  return {
    nodes,
    edges: data.edges.map(e => ({ ...e })),
  }
}

/**
 * Normalize FullGraph format to unified format
 */
export function normalizeFullGraphData(data: FullGraphData): UnifiedGraphData {
  return {
    nodes: data.nodes.map(node => ({
      ...node,
      isCenter: false,
      level: undefined,
    })),
    edges: data.edges.map(e => ({ ...e })),
  }
}

/**
 * Auto-detect format and normalize
 */
export function normalizeGraphData(
  noteGraphData?: NoteGraphData | null,
  fullGraphData?: FullGraphData | null,
): UnifiedGraphData | null {
  if (noteGraphData) {
    return normalizeNoteGraphData(noteGraphData)
  }
  if (fullGraphData) {
    return normalizeFullGraphData(fullGraphData)
  }
  return null
}
