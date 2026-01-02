import { queryCollection } from '@nuxt/content/server'
import { extractLinksFromBody } from '../../utils/minimark'

interface NoteGraphNode {
  id: string
  title: string
  type: string
  isCenter?: boolean
}

interface NoteGraphEdge {
  source: string
  target: string
}

interface NoteGraphData {
  center: NoteGraphNode
  connected: NoteGraphNode[]
  edges: NoteGraphEdge[]
}

interface ContentItem {
  path?: string
  stem?: string
  title?: string
  type?: string
  body?: unknown
}

// Helper: Extract slug from content item
function getSlug(item: ContentItem): string {
  return item.path?.slice(1) || item.stem || ''
}

// Helper: Find all notes that link to the target slug
function findBacklinks(allContent: ContentItem[], centerSlug: string): string[] {
  const backlinks: string[] = []
  for (const item of allContent) {
    const itemSlug = getSlug(item)
    if (itemSlug === centerSlug) continue

    const links = extractLinksFromBody(item.body)
    if (links.includes(centerSlug)) {
      backlinks.push(itemSlug)
    }
  }
  return backlinks
}

// Helper: Build connected nodes from content
function buildConnectedNodes(
  allContent: ContentItem[],
  connectedSlugs: string[],
): { connected: NoteGraphNode[], existingSlugs: Set<string> } {
  const connected: NoteGraphNode[] = []
  const existingSlugs = new Set<string>()

  for (const item of allContent) {
    const itemSlug = getSlug(item)
    existingSlugs.add(itemSlug)

    if (connectedSlugs.includes(itemSlug)) {
      connected.push({
        id: itemSlug,
        title: item.title || itemSlug,
        type: item.type || 'note',
      })
    }
  }

  return { connected, existingSlugs }
}

// Helper: Build edges from outgoing links and backlinks
function buildEdges(
  centerSlug: string,
  outgoingLinks: string[],
  backlinks: string[],
  existingSlugs: Set<string>,
): NoteGraphEdge[] {
  const edges: NoteGraphEdge[] = []

  for (const targetSlug of outgoingLinks) {
    if (existingSlugs.has(targetSlug)) {
      edges.push({ source: centerSlug, target: targetSlug })
    }
  }

  for (const sourceSlug of backlinks) {
    edges.push({ source: sourceSlug, target: centerSlug })
  }

  return edges
}

export default defineEventHandler(async (event): Promise<NoteGraphData | null> => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null

  try {
    const currentNote = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'body')
      .where('path', '=', `/${slug}`)
      .first()

    if (!currentNote) return null

    const centerSlug = getSlug(currentNote) || slug
    const outgoingLinks = extractLinksFromBody(currentNote.body)
    const uniqueOutgoingLinks = [...new Set(outgoingLinks)].filter(s => s !== centerSlug)

    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'body')
      .all()

    const backlinks = findBacklinks(allContent, centerSlug)
    const connectedSlugs = [...new Set([...uniqueOutgoingLinks, ...backlinks])]
    const { connected, existingSlugs } = buildConnectedNodes(allContent, connectedSlugs)
    const edges = buildEdges(centerSlug, uniqueOutgoingLinks, backlinks, existingSlugs)

    return {
      center: {
        id: centerSlug,
        title: currentNote.title || centerSlug,
        type: currentNote.type || 'note',
        isCenter: true,
      },
      connected,
      edges,
    }
  }
  catch (error) {
    console.error('Error building note graph data:', error)
    return null
  }
})
