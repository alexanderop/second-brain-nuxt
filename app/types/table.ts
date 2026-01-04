import { z } from 'zod'
import { contentTypeValues, type ContentType } from '~/constants/contentTypes'

// Content types array for filtering - derived from constants/contentTypes.ts (single source of truth)
export const CONTENT_TYPES = contentTypeValues

// Author with enriched data (joined from authors collection)
export interface TableAuthor {
  slug: string
  name: string
  avatar?: string
}

// Content item as displayed in the table (with enriched authors)
export interface TableContentItem {
  slug: string
  title: string
  type: ContentType
  authors: TableAuthor[]
  tags: string[]
  date?: string // Date consumed (ISO string)
  datePublished?: string // ISO string
  rating?: number // 1-7 scale
  url?: string
  cover?: string
}

// Filter state for the table
export interface FilterState {
  type?: ContentType[]
  tags?: string[]
  authors?: string[] // Author slugs
  dateConsumedRange?: [string, string] // ISO date strings
  datePublishedRange?: [string, string] // ISO date strings
  ratingRange?: [number, number]
}

// Sort state for the table
export interface SortState {
  column: 'title' | 'type' | 'dateConsumed' | 'datePublished' | 'rating'
  direction: 'asc' | 'desc'
}

// Zod schema for URL parameter validation
export const tableParamsSchema = z.object({
  // Filter params
  type: z.array(z.enum(CONTENT_TYPES)).optional(),
  tags: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  dateConsumedFrom: z.string().optional(),
  dateConsumedTo: z.string().optional(),
  datePublishedFrom: z.string().optional(),
  datePublishedTo: z.string().optional(),
  ratingMin: z.coerce.number().min(1).max(7).optional(),
  ratingMax: z.coerce.number().min(1).max(7).optional(),
  // Sort params
  sort: z.enum(['title', 'type', 'dateConsumed', 'datePublished', 'rating']).optional(),
  dir: z.enum(['asc', 'desc']).optional(),
  // Pagination
  page: z.coerce.number().min(1).optional(),
})

export type TableParams = z.infer<typeof tableParamsSchema>
