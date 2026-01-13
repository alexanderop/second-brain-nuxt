import { defineEventHandler, getRouterParam } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { extractLinksFromBody } from '../../utils/minimark'
import { tryCatchAsync } from '#shared/utils/tryCatch'

interface NoteGraphNode {
  id: string
  title: string
  type: string
  isCenter?: boolean
  level?: 0 | 1 | 2 // 0=center, 1=direct connection, 2=second-degree
}

interface NoteGraphEdge {
  source: string
  target: string
  level?: 1 | 2 // 1=center↔L1, 2=L1↔L2
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

// Helper: Build a backlink index for efficient lookups (O(N) build, O(1) lookup)
function buildBacklinkIndex(allContent: ContentItem[]): Map<string, string[]> {
  const index = new Map<string, string[]>()

  for (const item of allContent) {
    const sourceSlug = getSlug(item)
    const links = extractLinksFromBody(item.body)

    for (const targetSlug of links) {
      const existing = index.get(targetSlug) || []
      existing.push(sourceSlug)
      index.set(targetSlug, existing)
    }
  }

  return index
}

// Helper: Build outgoing links index for efficient lookups
function buildOutgoingLinksIndex(allContent: ContentItem[]): Map<string, string[]> {
  const index = new Map<string, string[]>()

  for (const item of allContent) {
    const sourceSlug = getSlug(item)
    const links = extractLinksFromBody(item.body)
    index.set(sourceSlug, links)
  }

  return index
}

// Helper: Build connected nodes from content with level
function buildConnectedNodes(
  allContent: ContentItem[],
  connectedSlugs: string[],
  level: 1 | 2,
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
        level,
      })
    }
  }

  return { connected, existingSlugs }
}

// Helper: Build L1 edges from outgoing links and backlinks
function buildL1Edges(
  centerSlug: string,
  outgoingLinks: string[],
  backlinks: string[],
  existingSlugs: Set<string>,
): NoteGraphEdge[] {
  const edges: NoteGraphEdge[] = []

  for (const targetSlug of outgoingLinks) {
    if (existingSlugs.has(targetSlug)) {
      edges.push({ source: centerSlug, target: targetSlug, level: 1 })
    }
  }

  for (const sourceSlug of backlinks) {
    edges.push({ source: sourceSlug, target: centerSlug, level: 1 })
  }

  return edges
}

// Max L2 nodes to prevent clutter
const MAX_LEVEL2_NODES = 20

// Helper: Check if slug is valid L2 candidate
function isValidL2Slug(
  slug: string,
  centerSlug: string,
  l1Slug: string,
  level1Set: Set<string>,
  existingSlugs: Set<string>,
): boolean {
  if (slug === centerSlug) return false
  if (level1Set.has(slug)) return false
  if (slug === l1Slug) return false
  if (!existingSlugs.has(slug)) return false
  return true
}

// Helper: Add L2 connections from a single L1 node
function addL1NodeConnections(
  l1Slug: string,
  centerSlug: string,
  level1Set: Set<string>,
  existingSlugs: Set<string>,
  outgoingIndex: Map<string, string[]>,
  backlinkIndex: Map<string, string[]>,
  level2Slugs: Set<string>,
  level2Edges: NoteGraphEdge[],
): void {
  // Outgoing links from L1
  for (const targetSlug of outgoingIndex.get(l1Slug) || []) {
    if (isValidL2Slug(targetSlug, centerSlug, l1Slug, level1Set, existingSlugs)) {
      level2Slugs.add(targetSlug)
      level2Edges.push({ source: l1Slug, target: targetSlug, level: 2 })
    }
  }

  // Backlinks to L1
  for (const sourceSlug of backlinkIndex.get(l1Slug) || []) {
    if (isValidL2Slug(sourceSlug, centerSlug, l1Slug, level1Set, existingSlugs)) {
      level2Slugs.add(sourceSlug)
      level2Edges.push({ source: sourceSlug, target: l1Slug, level: 2 })
    }
  }
}

// Helper: Collect L2 connections from L1 nodes
function collectLevel2Edges(
  level1Slugs: string[],
  centerSlug: string,
  existingSlugs: Set<string>,
  backlinkIndex: Map<string, string[]>,
  outgoingIndex: Map<string, string[]>,
): { level2Slugs: Set<string>, level2Edges: NoteGraphEdge[] } {
  const level1Set = new Set(level1Slugs)
  const level2Slugs = new Set<string>()
  const level2Edges: NoteGraphEdge[] = []

  for (const l1Slug of level1Slugs) {
    addL1NodeConnections(l1Slug, centerSlug, level1Set, existingSlugs, outgoingIndex, backlinkIndex, level2Slugs, level2Edges)
  }

  // Limit L2 nodes and filter edges
  const limitedL2Set = new Set([...level2Slugs].slice(0, MAX_LEVEL2_NODES))
  const filteredEdges = level2Edges.filter((e) => {
    // At build time, source/target are always strings
    return limitedL2Set.has(String(e.source)) || limitedL2Set.has(String(e.target))
  })

  return { level2Slugs: limitedL2Set, level2Edges: filteredEdges }
}

// Helper: Build L2 nodes from content
function buildL2Nodes(allContent: ContentItem[], level2Slugs: Set<string>): NoteGraphNode[] {
  const nodes: NoteGraphNode[] = []
  for (const item of allContent) {
    const itemSlug = getSlug(item)
    if (level2Slugs.has(itemSlug)) {
      nodes.push({ id: itemSlug, title: item.title || itemSlug, type: item.type || 'note', level: 2 })
    }
  }
  return nodes
}

// Helper: Build the graph data structure
function buildGraphData(
  currentNote: ContentItem,
  centerSlug: string,
  allContent: ContentItem[],
): NoteGraphData {
  const outgoingLinks = extractLinksFromBody(currentNote.body)
  const uniqueOutgoingLinks = [...new Set(outgoingLinks)].filter(s => s !== centerSlug)

  // Build indexes for efficient lookups
  const backlinkIndex = buildBacklinkIndex(allContent)
  const outgoingIndex = buildOutgoingLinksIndex(allContent)

  // L1: Direct connections
  const backlinks = findBacklinks(allContent, centerSlug)
  const level1Slugs = [...new Set([...uniqueOutgoingLinks, ...backlinks])]
  const { connected: level1Nodes, existingSlugs } = buildConnectedNodes(allContent, level1Slugs, 1)
  const level1Edges = buildL1Edges(centerSlug, uniqueOutgoingLinks, backlinks, existingSlugs)

  // L2: Second-degree connections
  const { level2Slugs, level2Edges } = collectLevel2Edges(level1Slugs, centerSlug, existingSlugs, backlinkIndex, outgoingIndex)
  const level2Nodes = buildL2Nodes(allContent, level2Slugs)

  return {
    center: { id: centerSlug, title: currentNote.title || centerSlug, type: currentNote.type || 'note', isCenter: true, level: 0 },
    connected: [...level1Nodes, ...level2Nodes],
    edges: [...level1Edges, ...level2Edges],
  }
}

export default defineEventHandler(async (event): Promise<NoteGraphData | null> => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null

  const [error, result] = await tryCatchAsync(async () => {
    const currentNote = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'body')
      .where('path', '=', `/${slug}`)
      .first()

    if (!currentNote) return null

    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'body')
      .all()

    const centerSlug = getSlug(currentNote) || slug
    return buildGraphData(currentNote, centerSlug, allContent)
  })

  if (error) {
    console.error('Error building note graph data:', error)
    return null
  }

  return result
})
