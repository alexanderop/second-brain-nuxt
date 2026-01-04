import { computed } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useSessionStorage } from '@vueuse/core'
import { useAsyncData, queryCollection } from '#imports'
import type { ContentType } from '~/constants/contentTypes'
import type { FilterState, SortState, TableAuthor, TableContentItem } from '~/types/table'
import { tableParamsSchema } from '~/types/table'

const PAGE_SIZE = 25

// Helper: Parse array query param (handles single value, array, or comma-separated)
export function parseArrayParam(value: string | Array<string> | null | undefined): Array<string> {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return value.split(',').filter(Boolean)
}

// Helper: Apply all filters except one (for dynamic filter options)
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

// Helper: Build date range tuple if both values exist
export function buildDateRange(from?: string, to?: string): [string, string] | undefined {
  if (!from || !to) return undefined
  return [from, to]
}

// Helper: Build rating range tuple if both values exist
export function buildRatingRange(min?: number, max?: number): [number, number] | undefined {
  if (min === undefined || max === undefined) return undefined
  return [min, max]
}

// Helper: Return array only if non-empty
export function nonEmptyArray<T>(arr?: T[]): T[] | undefined {
  return arr?.length ? arr : undefined
}

// Helper: Build filter state from parsed params
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

// Helper: Check if value is nullish
export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

// Helper: Compare two numbers
export function compareNumbers(a: number, b: number): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

// Helper to compare two values for sorting
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

// Helper to get sortable value from item
export function getSortValue(item: TableContentItem, column: SortState['column']): string | number | undefined {
  if (column === 'dateConsumed') return item.date
  if (column === 'title') return item.title
  if (column === 'type') return item.type
  if (column === 'rating') return item.rating
  return undefined
}

export function useContentTable() {
  // URL-synced params via VueUse
  const typeParam = useRouteQuery<string | null>('type')
  const tagsParam = useRouteQuery<string | null>('tags')
  const authorsParam = useRouteQuery<string | null>('authors')
  const dateConsumedFromParam = useRouteQuery<string | null>('dateConsumedFrom')
  const dateConsumedToParam = useRouteQuery<string | null>('dateConsumedTo')
  const ratingMinParam = useRouteQuery<string | null>('ratingMin')
  const ratingMaxParam = useRouteQuery<string | null>('ratingMax')
  const sortParam = useRouteQuery<string | null>('sort', 'dateConsumed')
  const dirParam = useRouteQuery<string | null>('dir', 'desc')
  const pageParam = useRouteQuery<string | null>('page', '1')

  // Validated filters from URL
  const filters = computed<FilterState>(() => {
    const raw = {
      type: parseArrayParam(typeParam.value),
      tags: parseArrayParam(tagsParam.value),
      authors: parseArrayParam(authorsParam.value),
      dateConsumedFrom: dateConsumedFromParam.value || undefined,
      dateConsumedTo: dateConsumedToParam.value || undefined,
      ratingMin: ratingMinParam.value ? Number(ratingMinParam.value) : undefined,
      ratingMax: ratingMaxParam.value ? Number(ratingMaxParam.value) : undefined,
    }

    const parsed = tableParamsSchema.safeParse(raw)
    if (!parsed.success) return {}

    return buildFilterState(parsed.data)
  })

  // Type guards for sort state
  const validColumns: readonly string[] = ['title', 'type', 'dateConsumed', 'rating']
  function isValidColumn(value: string | null): value is SortState['column'] {
    return value !== null && validColumns.includes(value)
  }

  function isValidDirection(value: string | null): value is SortState['direction'] {
    return value === 'asc' || value === 'desc'
  }

  const sort = computed<SortState>(() => {
    const column = isValidColumn(sortParam.value) ? sortParam.value : 'dateConsumed'
    const direction = isValidDirection(dirParam.value) ? dirParam.value : 'desc'
    return { column, direction }
  })

  const page = computed({
    get: () => Number.parseInt(pageParam.value || '1') || 1,
    set: (v) => { pageParam.value = String(v) },
  })

  // Fetch content and authors
  const { data: rawContent, status: contentStatus } = useAsyncData('table-content', () => {
    return queryCollection('content')
      .select('stem', 'title', 'type', 'authors', 'tags', 'date', 'rating', 'url', 'cover')
      .all()
  })

  const { data: rawAuthors } = useAsyncData('table-authors', () => {
    return queryCollection('authors')
      .select('slug', 'name', 'avatar')
      .all()
  })

  // Build author lookup map
  const authorMap = computed(() => {
    const map = new Map<string, TableAuthor>()
    if (rawAuthors.value) {
      for (const author of rawAuthors.value) {
        map.set(author.slug, {
          slug: author.slug,
          name: author.name,
          avatar: author.avatar,
        })
      }
    }
    return map
  })

  // Helper: Safely convert to string array
  function toStringArray(arr: unknown): string[] {
    if (!Array.isArray(arr)) return []
    return arr.filter((x): x is string => typeof x === 'string')
  }

  // Enriched content with author objects
  const allContent = computed<TableContentItem[]>(() => {
    if (!rawContent.value) return []

    return rawContent.value.map((item) => {
      const slug = String(item.stem)
      const authorSlugs = toStringArray(item.authors)
      return {
        slug,
        title: item.title,
        type: item.type,
        authors: authorSlugs.map((authorSlug) => {
          const author = authorMap.value.get(authorSlug)
          return author || { slug: authorSlug, name: authorSlug, avatar: undefined }
        }),
        tags: item.tags || [],
        date: item.date,
        rating: item.rating,
        url: item.url,
        cover: item.cover,
      }
    })
  })

  // Client-side filtering
  const filteredItems = computed(() => {
    let result = allContent.value
    const f = filters.value

    // Type filter (OR)
    const typeFilter = f.type
    if (typeFilter?.length) {
      result = result.filter(item => typeFilter.includes(item.type))
    }

    // Tags filter (OR) - exclude items without tags when filter active
    const tagsFilter = f.tags
    if (tagsFilter?.length) {
      result = result.filter((item) => {
        if (!item.tags?.length) return false
        return tagsFilter.some(t => item.tags.includes(t))
      })
    }

    // Authors filter (OR) - exclude items without authors when filter active
    const authorsFilter = f.authors
    if (authorsFilter?.length) {
      result = result.filter((item) => {
        if (!item.authors?.length) return false
        const slugs = item.authors.map(a => a.slug)
        return authorsFilter.some(a => slugs.includes(a))
      })
    }

    // Date consumed range
    if (f.dateConsumedRange) {
      const fromDate = new Date(f.dateConsumedRange[0])
      const toDate = new Date(f.dateConsumedRange[1])
      result = result.filter((item) => {
        if (!item.date) return false
        const date = new Date(item.date)
        return date >= fromDate && date <= toDate
      })
    }

    // Rating range
    if (f.ratingRange) {
      const [min, max] = f.ratingRange
      result = result.filter((item) => {
        if (item.rating === undefined) return false
        return item.rating >= min && item.rating <= max
      })
    }

    return result
  })

  // Client-side sorting
  const sortedItems = computed(() => {
    const items = [...filteredItems.value]
    const { column, direction } = sort.value

    items.sort((a, b) => {
      const aVal = getSortValue(a, column)
      const bVal = getSortValue(b, column)
      const cmp = compareValues(aVal, bVal)
      return direction === 'asc' ? cmp : -cmp
    })

    return items
  })

  // Pagination
  const paginatedItems = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE
    return sortedItems.value.slice(start, start + PAGE_SIZE)
  })

  const totalPages = computed(() => Math.ceil(sortedItems.value.length / PAGE_SIZE))
  const totalItems = computed(() => sortedItems.value.length)

  // Dynamic filter options (based on current filtered results, excluding self)
  const availableTags = computed(() => {
    const itemsWithoutTagFilter = applyFiltersExcept(allContent.value, filters.value, 'tags')
    return [...new Set(itemsWithoutTagFilter.flatMap(i => i.tags ?? []))].sort()
  })

  const availableAuthors = computed(() => {
    const itemsWithoutAuthorFilter = applyFiltersExcept(allContent.value, filters.value, 'authors')
    const authors = itemsWithoutAuthorFilter.flatMap(i => i.authors ?? [])
    const uniqueBySlug = [...new Map(authors.map(a => [a.slug, a])).values()]
    return uniqueBySlug.sort((a, b) => a.name.localeCompare(b.name))
  })

  const availableTypes = computed(() => {
    const itemsWithoutTypeFilter = applyFiltersExcept(allContent.value, filters.value, 'type')
    return [...new Set(itemsWithoutTypeFilter.map(i => i.type))].sort()
  })

  // Filter setters (reset page to 1)
  const setTypeFilter = (types: ContentType[]) => {
    typeParam.value = types.length ? types.join(',') : null
    pageParam.value = '1'
  }

  const setTagsFilter = (tags: string[]) => {
    tagsParam.value = tags.length ? tags.join(',') : null
    pageParam.value = '1'
  }

  const setAuthorsFilter = (authors: string[]) => {
    authorsParam.value = authors.length ? authors.join(',') : null
    pageParam.value = '1'
  }

  const setDateConsumedRange = (range: [string, string] | null) => {
    dateConsumedFromParam.value = range?.[0] ?? null
    dateConsumedToParam.value = range?.[1] ?? null
    pageParam.value = '1'
  }

  const setRatingRange = (range: [number, number] | null) => {
    ratingMinParam.value = range?.[0]?.toString() ?? null
    ratingMaxParam.value = range?.[1]?.toString() ?? null
    pageParam.value = '1'
  }

  const setSort = (column: SortState['column'], direction: SortState['direction']) => {
    sortParam.value = column
    dirParam.value = direction
  }

  const clearFilters = () => {
    typeParam.value = null
    tagsParam.value = null
    authorsParam.value = null
    dateConsumedFromParam.value = null
    dateConsumedToParam.value = null
    ratingMinParam.value = null
    ratingMaxParam.value = null
    pageParam.value = '1'
  }

  const hasActiveFilters = computed(() => {
    const f = filters.value
    return !!(
      f.type?.length
      || f.tags?.length
      || f.authors?.length
      || f.dateConsumedRange
      || f.ratingRange
    )
  })

  // Scroll position restoration
  const scrollPosition = useSessionStorage('table-scroll', 0)

  // Loading state
  const pending = computed(() => contentStatus.value === 'pending')

  return {
    // Data
    items: paginatedItems,
    pending,
    totalItems,
    totalPages,
    allContent,

    // Filter state
    filters,
    hasActiveFilters,
    availableTags,
    availableAuthors,

    // Sort state
    sort,

    // Pagination
    page,
    pageSize: PAGE_SIZE,

    // Actions
    setTypeFilter,
    setTagsFilter,
    setAuthorsFilter,
    setDateConsumedRange,
    setRatingRange,
    setSort,
    clearFilters,

    // Scroll restoration
    scrollPosition,

    // Dynamic filter options
    availableTypes,
  }
}
