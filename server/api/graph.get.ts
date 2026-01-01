import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

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

// Extract wiki-links from markdown content
function extractWikiLinks(content: string): Array<string> {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  const links: Array<string> = []

  for (const match of content.matchAll(wikiLinkRegex)) {
    if (match[1]) {
      const slug = match[1].toLowerCase().replace(/\s+/g, '-')
      links.push(slug)
    }
  }

  return [...new Set(links)]
}

// Parse frontmatter from markdown file
function parseFrontmatter(content: string): { title: string, type: string, tags: Array<string>, summary?: string } | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch || !frontmatterMatch[1])
    return null

  const frontmatter = frontmatterMatch[1]
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/)
  const typeMatch = frontmatter.match(/type:\s*(\w+)/)
  const summaryMatch = frontmatter.match(/summary:\s*["']?([^"'\n]+)["']?/)

  // Extract tags - simple line-by-line parsing
  const tags: Array<string> = []
  const lines = frontmatter.split('\n')
  let inTags = false
  for (const line of lines) {
    if (line.startsWith('tags:')) {
      inTags = true
      continue
    }
    if (inTags) {
      const tagMatch = line.match(/^[\t ]+- (.+)$/)
      if (tagMatch?.[1]) {
        tags.push(tagMatch[1].trim())
      }
      else if (!line.startsWith(' ') && !line.startsWith('\t') && line.trim()) {
        inTags = false
      }
    }
  }

  return {
    title: titleMatch?.[1] ?? 'Untitled',
    type: typeMatch?.[1] ?? 'note',
    tags,
    summary: summaryMatch?.[1],
  }
}

export default defineEventHandler(async (): Promise<GraphData> => {
  const contentDir = join(process.cwd(), 'content')
  const nodes: Array<GraphNode> = []
  const edges: Array<GraphEdge> = []
  const existingNodes = new Set<string>()

  try {
    const files = await readdir(contentDir)
    const mdFiles = files.filter((f: string) => f.endsWith('.md'))

    // First pass: create nodes
    const fileContents: Map<string, string> = new Map()

    for (const file of mdFiles) {
      const filePath = join(contentDir, file)
      const content = await readFile(filePath, 'utf-8')
      const slug = file.replace(/\.md$/, '')
      const meta = parseFrontmatter(content)

      nodes.push({
        id: slug,
        title: meta?.title ?? slug,
        type: meta?.type ?? 'note',
        tags: meta?.tags ?? [],
        summary: meta?.summary,
        connections: 0,
      })

      existingNodes.add(slug)
      fileContents.set(slug, content)
    }

    // Second pass: create edges
    for (const [sourceSlug, content] of fileContents) {
      const links = extractWikiLinks(content)

      for (const targetSlug of links) {
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
