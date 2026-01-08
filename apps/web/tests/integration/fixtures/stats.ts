/**
 * Stats response fixtures for integration tests
 *
 * Note: These fixtures match the StatsData type from server/api/stats.get.ts
 */

export interface TypeCount {
  type: string
  count: number
}

export interface TagCount {
  tag: string
  count: number
}

export interface AuthorCount {
  author: string
  count: number
}

export interface MonthCount {
  month: string
  count: number
}

export interface HubNode {
  id: string
  title: string
  type: string
  connections: number
}

export interface OrphanNode {
  id: string
  title: string
  type: string
}

export interface StatsFixture {
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
    orphans: OrphanNode[]
  }
  thisWeek: number
}

export const emptyStats: StatsFixture = {
  total: 0,
  byType: [],
  byTag: [],
  byAuthor: [],
  byMonth: [],
  quality: { withSummary: 0, withNotes: 0, total: 0 },
  connections: {
    totalEdges: 0,
    avgPerNote: 0,
    orphanCount: 0,
    orphanPercent: 0,
    hubs: [],
    orphans: [],
  },
  thisWeek: 0,
}

export const simpleStats: StatsFixture = {
  total: 10,
  byType: [
    { type: 'book', count: 5 },
    { type: 'article', count: 3 },
    { type: 'note', count: 2 },
  ],
  byTag: [
    { tag: 'productivity', count: 4 },
    { tag: 'psychology', count: 2 },
  ],
  byAuthor: [
    { author: 'james-clear', count: 2 },
  ],
  byMonth: [
    { month: '2024-01', count: 3 },
    { month: '2024-02', count: 7 },
  ],
  quality: { withSummary: 8, withNotes: 5, total: 10 },
  connections: {
    totalEdges: 15,
    avgPerNote: 1.5,
    orphanCount: 2,
    orphanPercent: 20,
    hubs: [
      { id: 'atomic-habits', title: 'Atomic Habits', type: 'book', connections: 8 },
    ],
    orphans: [
      { id: 'orphan-note', title: 'Orphan Note', type: 'note' },
    ],
  },
  thisWeek: 2,
}

export function createStatsResponse(overrides: Partial<StatsFixture> = {}): StatsFixture {
  return { ...simpleStats, ...overrides }
}
