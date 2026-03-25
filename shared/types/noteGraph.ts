/** Node in the note-specific graph API response */
export interface NoteGraphNode {
  id: string;
  title: string;
  type: string;
  isCenter?: boolean;
  level?: 0 | 1 | 2; // 0=center, 1=direct connection, 2=second-degree
}

/** Edge in the note-specific graph API response */
export interface NoteGraphEdge {
  source: string;
  target: string;
  level?: 1 | 2; // 1=center<->L1, 2=L1<->L2
}

/** Note-specific graph API response */
export interface NoteGraphData {
  center: NoteGraphNode;
  connected: NoteGraphNode[];
  edges: NoteGraphEdge[];
}
