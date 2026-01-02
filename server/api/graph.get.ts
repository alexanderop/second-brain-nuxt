import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { extractLinksFromBody } from '../utils/minimark'

interface GraphNode {
  id: string
  title: string
  type: string
  tags: Array<string>
  authors: Array<string>
  summary?: string
  connections: number
  maps: Array<string>
  isMap: boolean
}

interface GraphEdge {
  source: string
  target: string
}

interface GraphData {
  nodes: Array<GraphNode>
  edges: Array<GraphEdge>
}

interface ContentItem {
  path?: string
  stem?: string
  title?: string
  type?: string
  tags?: string[]
  authors?: string[]
  summary?: string
  body?: unknown
}

// Helper: Extract slug from content item
function getSlug(item: ContentItem): string {
  return item.path?.slice(1) || item.stem || ''
}

// Helper: Create a graph node from content item
function createNode(item: ContentItem): GraphNode {
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

// Helper: Extract edges from content item
function extractEdges(item: ContentItem, existingNodes: Set<string>): GraphEdge[] {
  const sourceSlug = getSlug(item)
  const links = extractLinksFromBody(item.body)
  const uniqueLinks = [...new Set(links)]

  return uniqueLinks
    .filter(targetSlug => existingNodes.has(targetSlug) && targetSlug !== sourceSlug)
    .map(targetSlug => ({ source: sourceSlug, target: targetSlug }))
}

// Helper: Calculate connection counts from edges
function calculateConnectionCounts(nodes: GraphNode[], edges: GraphEdge[]): void {
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

// Helper: Compute map membership for nodes
function computeMapMembership(allContent: ContentItem[], nodeMap: Map<string, GraphNode>): void {
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

export default defineEventHandler(async (event): Promise<GraphData> => {
  try {
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'authors', 'summary', 'body')
      .all()

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
  catch (error) {
    console.error('Error building graph data:', error)
    return { nodes: [], edges: [] }
  }
})
