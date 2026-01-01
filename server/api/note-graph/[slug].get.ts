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

export default defineEventHandler(async (event): Promise<NoteGraphData | null> => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    return null
  }

  try {
    // Query the current note
    const currentNote = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'body')
      .where('path', '=', `/${slug}`)
      .first()

    if (!currentNote) {
      return null
    }

    const centerSlug = currentNote.path?.slice(1) || currentNote.stem || slug

    // Extract outgoing links from this note
    const outgoingLinks = extractLinksFromBody(currentNote.body)
    const uniqueOutgoingLinks = [...new Set(outgoingLinks)].filter(s => s !== centerSlug)

    // Query all content to find backlinks (notes linking TO this note)
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'body')
      .all()

    // Find backlinks (notes that link to this note)
    const backlinks: string[] = []
    for (const item of allContent) {
      const itemSlug = item.path?.slice(1) || item.stem || ''
      if (itemSlug === centerSlug) continue

      const links = extractLinksFromBody(item.body)
      if (links.includes(centerSlug)) {
        backlinks.push(itemSlug)
      }
    }

    // Combine outgoing and incoming slugs (unique)
    const connectedSlugs = [...new Set([...uniqueOutgoingLinks, ...backlinks])]

    // Build nodes for connected notes
    const connected: NoteGraphNode[] = []
    const existingSlugs = new Set<string>()

    for (const item of allContent) {
      const itemSlug = item.path?.slice(1) || item.stem || ''
      existingSlugs.add(itemSlug)

      if (connectedSlugs.includes(itemSlug)) {
        connected.push({
          id: itemSlug,
          title: item.title || itemSlug,
          type: item.type || 'note',
        })
      }
    }

    // Build edges (only to existing nodes)
    const edges: NoteGraphEdge[] = []

    // Outgoing edges (from center to targets)
    for (const targetSlug of uniqueOutgoingLinks) {
      if (existingSlugs.has(targetSlug)) {
        edges.push({
          source: centerSlug,
          target: targetSlug,
        })
      }
    }

    // Incoming edges (from sources to center)
    for (const sourceSlug of backlinks) {
      edges.push({
        source: sourceSlug,
        target: centerSlug,
      })
    }

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
