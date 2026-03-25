import type { ContentType } from "~/constants/contentTypes";
import type { GraphNode as SharedGraphNode } from "#shared/types/graph";
import type { NoteGraphData as SharedNoteGraphData } from "#shared/types/noteGraph";

/**
 * Unified node representation used internally by BaseGraph.
 * Both input formats are normalized to this structure.
 */
export interface UnifiedGraphNode {
  id: string;
  title: string;
  type: ContentType | string;

  // Optional metadata (from FullGraphData format)
  tags?: string[];
  authors?: string[];
  summary?: string;
  maps?: string[];

  // Layout hints
  isCenter?: boolean; // For radial mode: the focal node
  level?: 0 | 1 | 2; // For radial mode: distance from center
  connections?: number; // For freeform mode: sizing by importance
  isMap?: boolean; // Determines hexagon shape in freeform mode

  // D3 simulation properties (added at runtime)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface UnifiedGraphEdge {
  source: string | UnifiedGraphNode;
  target: string | UnifiedGraphNode;
  level?: 1 | 2; // For radial mode edge styling
}

/**
 * Unified internal format after normalization
 */
export interface UnifiedGraphData {
  nodes: UnifiedGraphNode[];
  edges: UnifiedGraphEdge[];
}

/**
 * Input format A: NoteGraph data (center-focused, level-based)
 */
export type NoteGraphData = SharedNoteGraphData;

/**
 * Node in FullGraphData format.
 * Narrows the shared GraphNode type field to ContentType for app-side usage.
 */
export interface FullGraphNode extends Omit<SharedGraphNode, "type" | "connections" | "maps" | "isMap"> {
  type: ContentType;
  connections?: number;
  maps?: string[];
  isMap?: boolean;
}

/**
 * Edge in FullGraphData format (source/target can be string or object after D3 processing)
 */
export interface FullGraphEdge {
  source: string | FullGraphNode;
  target: string | FullGraphNode;
}

/**
 * Input format B: KnowledgeGraph data (flat nodes with counts)
 */
export interface FullGraphData {
  nodes: FullGraphNode[];
  edges: FullGraphEdge[];
}
