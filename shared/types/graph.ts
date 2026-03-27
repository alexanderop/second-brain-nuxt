/** Node in the knowledge graph API response */
export interface GraphNode {
  id: string;
  title: string;
  type: string;
  tags: string[];
  authors: string[];
  summary?: string;
  connections: number;
  maps: string[];
  isMap: boolean;
}

/** Edge in the knowledge graph API response */
export interface GraphEdge {
  source: string;
  target: string;
}

/** Full knowledge graph API response */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
