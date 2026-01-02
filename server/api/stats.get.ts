import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'

interface ContentItem {
  type: string
  tags?: string[]
  authors?: string[]
  date?: string
  summary?: string
  notes?: string
}

interface GraphNode {
  id: string
  title: string
  type: string
  connections: number
}

interface GraphData {
  nodes: GraphNode[]
  edges: Array<{ source: string, target: string }>
}

interface TypeCount {
  type: string
  count: number
}

interface TagCount {
  tag: string
  count: number
}

interface AuthorCount {
  author: string
  count: number
}

interface MonthCount {
  month: string
  count: number
}

interface HubNode {
  id: string
  title: string
  type: string
  connections: number
}

interface StatsData {
  total: number
  byType: TypeCount[]
  byTag: TagCount[]
  byAuthor: AuthorCount[]
  byMonth: MonthCount[]
  quality: {
    withSummary: number
    withNotes: number
    total: number
  }
  connections: {
    totalEdges: number
    avgPerNote: number
    orphanCount: number
    orphanPercent: number
    hubs: HubNode[]
  }
  thisWeek: number
}

function aggregateByType(items: ContentItem[]): TypeCount[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.type, (counts.get(item.type) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

function aggregateByTag(items: ContentItem[]): TagCount[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

function aggregateByAuthor(items: ContentItem[]): AuthorCount[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const author of item.authors || []) {
      counts.set(author, (counts.get(author) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
}

function aggregateByMonth(items: ContentItem[]): MonthCount[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    if (item.date) {
      // Extract YYYY-MM from date string
      const month = item.date.substring(0, 7)
      counts.set(month, (counts.get(month) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function countThisWeek(items: ContentItem[]): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekAgoStr = oneWeekAgo.toISOString().substring(0, 10)

  return items.filter((item) => {
    if (!item.date) return false
    return item.date >= weekAgoStr
  }).length
}

async function fetchGraphData(event: H3Event): Promise<GraphData> {
  // Fetch from internal API endpoint
  const baseUrl = getRequestURL(event).origin
  try {
    return await $fetch<GraphData>(`${baseUrl}/api/graph`)
  }
  catch {
    // Fallback: return empty data if graph endpoint fails
    return { nodes: [], edges: [] }
  }
}

export default defineCachedEventHandler(async (event): Promise<StatsData> => {
  // Query content with minimal fields needed for stats
  const allContent: ContentItem[] = await queryCollection(event, 'content')
    .select('type', 'tags', 'authors', 'date', 'summary', 'notes')
    .all()

  // Fetch graph data for connection metrics
  const graphData = await fetchGraphData(event)

  // Calculate orphans (nodes with 0 connections)
  const orphanCount = graphData.nodes.filter(n => n.connections === 0).length
  const orphanPercent = graphData.nodes.length > 0
    ? Math.round((orphanCount / graphData.nodes.length) * 1000) / 10
    : 0

  // Get top hub notes (most connected)
  const hubs = graphData.nodes
    .filter(n => n.connections > 0)
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5)
    .map(n => ({
      id: n.id,
      title: n.title,
      type: n.type,
      connections: n.connections,
    }))

  return {
    total: allContent.length,
    byType: aggregateByType(allContent),
    byTag: aggregateByTag(allContent),
    byAuthor: aggregateByAuthor(allContent),
    byMonth: aggregateByMonth(allContent),
    quality: {
      withSummary: allContent.filter(c => c.summary).length,
      withNotes: allContent.filter(c => c.notes).length,
      total: allContent.length,
    },
    connections: {
      totalEdges: graphData.edges.length,
      avgPerNote: graphData.nodes.length > 0
        ? Math.round((graphData.edges.length / graphData.nodes.length) * 10) / 10
        : 0,
      orphanCount,
      orphanPercent,
      hubs,
    },
    thisWeek: countThisWeek(allContent),
  }
}, {
  maxAge: 60 * 10, // Cache for 10 minutes
  swr: true, // Stale-while-revalidate
  name: 'stats',
})
