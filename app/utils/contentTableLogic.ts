/**
 * Pure functions for content table filtering, sorting, and pagination.
 * No Vue imports, no side effects, no external dependencies.
 */

import type { ContentType } from '~/constants/contentTypes'
import type { FilterState, SortState, TableAuthor, TableContentItem } from '~/types/table'

/**
 * Parse array query param (handles single value, array, or comma-separated).
 */
export function parseArrayParam(value: string | Array<string> | null | undefined): Array<string> {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return value.split(',').filter(Boolean)
}

/**
 * Apply all filters except one (for dynamic filter options).
 */
export function applyFiltersExcept<T extends { type: ContentType, tags?: string[], authors?: TableAuthor[] }>(
  items: T[],
  filters: FilterState,
  exclude: keyof FilterState,
): T[] {
  let result = items

  // Type filter (OR)
  const typeFilter = filters.type
  if (exclude !== 'type' && typeFilter?.length) {
    result = result.filter(item => typeFilter.includes(item.type))
  }

  // Tags filter (OR)
  const tagsFilter = filters.tags
  if (exclude !== 'tags' && tagsFilter?.length) {
    result = result.filter((item) => {
      const itemTags = item.tags
      if (!itemTags?.length) return false
      return tagsFilter.some(t => itemTags.includes(t))
    })
  }

  // Authors filter (OR)
  const authorsFilter = filters.authors
  if (exclude !== 'authors' && authorsFilter?.length) {
    result = result.filter((item) => {
      if (!item.authors?.length) return false
      const slugs = item.authors.map(a => a.slug)
      return authorsFilter.some(a => slugs.includes(a))
    })
  }

  return result
}

/**
 * Build date range tuple if both values exist.
 */
export function buildDateRange(from?: string, to?: string): [string, string] | undefined {
  if (!from || !to) return undefined
  return [from, to]
}

/**
 * Build rating range tuple if both values exist.
 */
export function buildRatingRange(min?: number, max?: number): [number, number] | undefined {
  if (min === undefined || max === undefined) return undefined
  return [min, max]
}

/**
 * Return array only if non-empty.
 */
export function nonEmptyArray<T>(arr?: T[]): T[] | undefined {
  return arr?.length ? arr : undefined
}

/**
 * Build filter state from parsed params.
 */
export function buildFilterState(data: {
  type?: ContentType[]
  tags?: string[]
  authors?: string[]
  dateConsumedFrom?: string
  dateConsumedTo?: string
  ratingMin?: number
  ratingMax?: number
}): FilterState {
  return {
    type: nonEmptyArray(data.type),
    tags: nonEmptyArray(data.tags),
    authors: nonEmptyArray(data.authors),
    dateConsumedRange: buildDateRange(data.dateConsumedFrom, data.dateConsumedTo),
    ratingRange: buildRatingRange(data.ratingMin, data.ratingMax),
  }
}

/**
 * Check if value is nullish.
 */
export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

/**
 * Filter items by content type (OR logic).
 */
export function filterByType<T extends { type: ContentType }>(
  items: T[],
  types: ContentType[] | undefined,
): T[] {
  if (!types?.length) return items
  return items.filter(item => types.includes(item.type))
}

/**
 * Filter items by tags (OR logic).
 */
export function filterByTags<T extends { tags?: string[] }>(
  items: T[],
  tags: string[] | undefined,
): T[] {
  if (!tags?.length) return items
  return items.filter((item) => {
    const itemTags = item.tags
    if (!itemTags?.length) return false
    return tags.some(t => itemTags.includes(t))
  })
}

/**
 * Filter items by author slugs (OR logic).
 */
export function filterByAuthors<T extends { authors?: TableAuthor[] }>(
  items: T[],
  authorSlugs: string[] | undefined,
): T[] {
  if (!authorSlugs?.length) return items
  return items.filter((item) => {
    if (!item.authors?.length) return false
    const slugs = item.authors.map(a => a.slug)
    return authorSlugs.some(a => slugs.includes(a))
  })
}

/**
 * Filter items by date range (inclusive).
 */
export function filterByDateRange<T extends { date?: string }>(
  items: T[],
  range: [string, string] | undefined,
): T[] {
  if (!range) return items
  const [from, to] = range
  const fromDate = new Date(from)
  const toDate = new Date(to)
  return items.filter((item) => {
    if (!item.date) return false
    const date = new Date(item.date)
    return date >= fromDate && date <= toDate
  })
}

/**
 * Filter items by rating range (inclusive).
 */
export function filterByRatingRange<T extends { rating?: number }>(
  items: T[],
  range: [number, number] | undefined,
): T[] {
  if (!range) return items
  const [min, max] = range
  return items.filter((item) => {
    if (item.rating === undefined) return false
    return item.rating >= min && item.rating <= max
  })
}

/**
 * Apply all filters to items.
 */
export function applyAllFilters(
  items: TableContentItem[],
  filters: FilterState,
): TableContentItem[] {
  let result = items
  result = filterByType(result, filters.type)
  result = filterByTags(result, filters.tags)
  result = filterByAuthors(result, filters.authors)
  result = filterByDateRange(result, filters.dateConsumedRange)
  result = filterByRatingRange(result, filters.ratingRange)
  return result
}

/**
 * Compare two numbers.
 */
export function compareNumbers(a: number, b: number): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Compare two values for sorting.
 */
export function compareValues(aVal: string | number | undefined, bVal: string | number | undefined): number {
  // Handle nulls (push to end)
  if (isNullish(aVal)) return isNullish(bVal) ? 0 : 1
  if (isNullish(bVal)) return -1

  // Compare strings
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return aVal.localeCompare(bVal)
  }

  // Compare numbers
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return compareNumbers(aVal, bVal)
  }
  return 0
}

/**
 * Get sortable value from item based on column.
 */
export function getSortValue(item: TableContentItem, column: SortState['column']): string | number | undefined {
  if (column === 'dateConsumed') return item.date
  if (column === 'title') return item.title
  if (column === 'type') return item.type
  if (column === 'rating') return item.rating
  return undefined
}

/**
 * Sort items by column and direction.
 */
export function sortItems(
  items: TableContentItem[],
  column: SortState['column'],
  direction: SortState['direction'],
): TableContentItem[] {
  const sorted = [...items]
  sorted.sort((a, b) => {
    const aVal = getSortValue(a, column)
    const bVal = getSortValue(b, column)
    const cmp = compareValues(aVal, bVal)
    return direction === 'asc' ? cmp : -cmp
  })
  return sorted
}

/**
 * Paginate items.
 */
export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

/**
 * Calculate total pages.
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize)
}

const validColumns: readonly string[] = ['title', 'type', 'dateConsumed', 'rating']

/**
 * Validate sort column.
 */
export function isValidColumn(value: string | null): value is SortState['column'] {
  return value !== null && validColumns.includes(value)
}

/**
 * Validate sort direction.
 */
export function isValidDirection(value: string | null): value is SortState['direction'] {
  return value === 'asc' || value === 'desc'
}

/**
 * Safely convert to string array.
 */
export function toStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  return arr.filter((x): x is string => typeof x === 'string')
}

/**
 * Build author lookup map.
 */
export function buildAuthorMap(authors: Array<{ slug: string, name: string, avatar?: string }>): Map<string, TableAuthor> {
  const map = new Map<string, TableAuthor>()
  for (const author of authors) {
    map.set(author.slug, {
      slug: author.slug,
      name: author.name,
      avatar: author.avatar,
    })
  }
  return map
}

/**
 * Enrich content items with author objects.
 */
export function enrichContentWithAuthors<T extends { stem: unknown, title: string, type: ContentType, authors?: unknown, tags?: string[], date?: string, rating?: number, url?: string, cover?: string }>(
  content: T[],
  authorMap: Map<string, TableAuthor>,
): TableContentItem[] {
  return content.map((item) => {
    const slug = String(item.stem)
    const authorSlugs = toStringArray(item.authors)
    return {
      slug,
      title: item.title,
      type: item.type,
      authors: authorSlugs.map((authorSlug) => {
        const author = authorMap.get(authorSlug)
        return author || { slug: authorSlug, name: authorSlug, avatar: undefined }
      }),
      tags: item.tags || [],
      date: item.date,
      rating: item.rating,
      url: item.url,
      cover: item.cover,
    }
  })
}
