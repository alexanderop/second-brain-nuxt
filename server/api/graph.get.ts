import { queryCollection } from '@nuxt/content/server'

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

// Recursively extract internal links from AST body
function extractLinksFromAst(node: unknown): Array<string> {
  const links: Array<string> = []

  if (!node || typeof node !== 'object') return links

  const n = node as Record<string, unknown>

  // Check if this is a link element with internal href
  if (n.tag === 'a' && typeof n.props === 'object' && n.props !== null) {
    const props = n.props as Record<string, unknown>
    const href = props.href
    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
      // Extract slug from href (remove leading slash)
      const slugParts = href.slice(1).split('#')[0]?.split('?')[0]
      if (slugParts) {
        links.push(slugParts)
      }
    }
  }

  // Recursively check children
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      links.push(...extractLinksFromAst(child))
    }
  }

  // Also check body if it exists (for root content object)
  if (n.body && typeof n.body === 'object') {
    links.push(...extractLinksFromAst(n.body))
  }

  return links
}

export default defineEventHandler(async (event): Promise<GraphData> => {
  const nodes: Array<GraphNode> = []
  const edges: Array<GraphEdge> = []
  const existingNodes = new Set<string>()

  try {
    // Query all content from the database using auto-imported queryCollection
    const allContent = await queryCollection(event, 'content').all()

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

      // Extract links from the parsed body AST
      const links = extractLinksFromAst(item.body)
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
