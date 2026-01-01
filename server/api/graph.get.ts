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

// Minimark node type: [tag, props, ...children]
type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]

// Extract internal links from minimark body format
// Minimark uses arrays: [tag, props, ...children] instead of objects
function extractLinksFromMinimark(node: unknown): Array<string> {
  const links: Array<string> = []

  if (!node) return links

  // Handle minimark node format: [tag, props, ...children]
  if (Array.isArray(node)) {
    const [tag, props, ...children] = node as MinimarkNode

    // Check if this is an anchor tag with internal href
    if (tag === 'a' && typeof props === 'object' && props !== null) {
      const href = props.href
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        // Extract slug from href (remove leading slash)
        const slugParts = href.slice(1).split('#')[0]?.split('?')[0]
        if (slugParts) {
          links.push(slugParts)
        }
      }
    }

    // Recursively process children
    for (const child of children) {
      links.push(...extractLinksFromMinimark(child))
    }
  }

  return links
}

// Extract links from the body object which contains minimark value array
function extractLinksFromBody(body: unknown): Array<string> {
  const links: Array<string> = []

  if (!body || typeof body !== 'object') return links

  const b = body as { type?: string, value?: unknown[] }

  // Handle minimark format: { type: 'minimark', value: [...nodes] }
  if (b.type === 'minimark' && Array.isArray(b.value)) {
    for (const node of b.value) {
      links.push(...extractLinksFromMinimark(node))
    }
  }

  return links
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
