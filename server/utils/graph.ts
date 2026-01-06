/**
 * Pure functions for building knowledge graph data from content items.
 * Extracted from server/api/graph.get.ts for testability.
 */

import { extractLinksFromBody } from './minimark'

export interface GraphNode {
  id: string
  title: string
  type: string
  tags: string[]
  authors: string[]
  summary?: string
  connections: number
  maps: string[]
  isMap: boolean
}

export interface GraphEdge {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ContentItem {
  path?: string
  stem?: string
  title?: string
  type?: string
  tags?: string[]
  authors?: string[]
  summary?: string
  body?: unknown
}

/**
 * Extract slug from content item path or stem
 */
export function getSlug(item: ContentItem): string {
  return item.path?.slice(1) || item.stem || ''
}

/**
 * Create a graph node from a content item
 */
export function createNode(item: ContentItem): GraphNode {
  const slug = getSlug(item)
  return {
    id: slug,
    title: item.title || slug,
    type: item.type || 'note',
    tags: Array.isArray(item.tags) ? item.tags : [],
    authors: Array.isArray(item.authors) ? item.authors : [],
    summary: item.summary,
    connections: 0,
    maps: [],
    isMap: item.type === 'map',
  }
}

/**
 * Extract edges (links) from a content item to existing nodes
 */
export function extractEdges(item: ContentItem, existingNodes: Set<string>): GraphEdge[] {
  const sourceSlug = getSlug(item)
  const links = extractLinksFromBody(item.body)
  const uniqueLinks = [...new Set(links)]

  return uniqueLinks
    .filter(targetSlug => existingNodes.has(targetSlug) && targetSlug !== sourceSlug)
    .map(targetSlug => ({ source: sourceSlug, target: targetSlug }))
}

/**
 * Calculate connection counts for nodes based on edges (mutates nodes)
 */
export function calculateConnectionCounts(nodes: GraphNode[], edges: GraphEdge[]): void {
  const counts = new Map<string, number>()
  for (const node of nodes) {
    counts.set(node.id, 0)
  }
  for (const edge of edges) {
    counts.set(edge.source, (counts.get(edge.source) || 0) + 1)
    counts.set(edge.target, (counts.get(edge.target) || 0) + 1)
  }
  for (const node of nodes) {
    node.connections = counts.get(node.id) || 0
  }
}

/**
 * Compute map membership for nodes (mutates nodes)
 */
export function computeMapMembership(allContent: ContentItem[], nodeMap: Map<string, GraphNode>): void {
  for (const item of allContent) {
    if (item.type !== 'map') continue

    const mapSlug = getSlug(item)
    const links = extractLinksFromBody(item.body)
    const uniqueLinks = [...new Set(links)]

    for (const targetSlug of uniqueLinks) {
      const targetNode = nodeMap.get(targetSlug)
      if (targetNode && targetSlug !== mapSlug) {
        targetNode.maps.push(mapSlug)
      }
    }
  }
}

/**
 * Build complete graph data from content items.
 * This is the main entry point for graph generation.
 */
export function buildGraphFromContent(allContent: ContentItem[]): GraphData {
  // First pass: create nodes
  const nodes = allContent.map(createNode)
  const existingNodes = new Set(nodes.map(n => n.id))

  // Second pass: create edges
  const edges = allContent.flatMap(item => extractEdges(item, existingNodes))

  // Calculate connection counts
  calculateConnectionCounts(nodes, edges)

  // Third pass: compute map membership
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  computeMapMembership(allContent, nodeMap)

  return { nodes, edges }
}
