import { queryCollection } from '@nuxt/content/server'
import { extractLinksFromBody } from '../utils/minimark'

interface GraphNode {
  id: string
  title: string
  type: string
  tags: Array<string>
  summary?: string
  connections: number
}

interface GraphEdge {
  source: string
  target: string
}

interface GraphData {
  nodes: Array<GraphNode>
  edges: Array<GraphEdge>
}

export default defineEventHandler(async (event): Promise<GraphData> => {
  const nodes: Array<GraphNode> = []
  const edges: Array<GraphEdge> = []
  const existingNodes = new Set<string>()

  try {
    // Query all content from the database using auto-imported queryCollection
    // Must explicitly select body to get the AST for link extraction
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'summary', 'body')
      .all()

    // First pass: create nodes
    for (const item of allContent) {
      const slug = item.path?.slice(1) || item.stem || ''

      nodes.push({
        id: slug,
        title: item.title || slug,
        type: item.type || 'note',
        tags: Array.isArray(item.tags) ? item.tags : [],
        summary: item.summary,
        connections: 0,
      })

      existingNodes.add(slug)
    }

    // Second pass: create edges by extracting links from AST
    for (const item of allContent) {
      const sourceSlug = item.path?.slice(1) || item.stem || ''

      // Extract links from the parsed body (minimark format)
      const links = extractLinksFromBody(item.body)
      const uniqueLinks = [...new Set(links)]

      for (const targetSlug of uniqueLinks) {
        // Only create edges to existing nodes, avoid self-links
        if (existingNodes.has(targetSlug) && targetSlug !== sourceSlug) {
          edges.push({
            source: sourceSlug,
            target: targetSlug,
          })
        }
      }
    }

    // Calculate connection counts (both directions count)
    const connectionCounts = new Map<string, number>()
    for (const node of nodes) {
      connectionCounts.set(node.id, 0)
    }
    for (const edge of edges) {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1)
      connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1)
    }
    for (const node of nodes) {
      node.connections = connectionCounts.get(node.id) || 0
    }

    return { nodes, edges }
  }
  catch (error) {
    console.error('Error building graph data:', error)
    return { nodes: [], edges: [] }
  }
})
