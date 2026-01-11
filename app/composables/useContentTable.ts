import { computed } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useSessionStorage } from '@vueuse/core'
import { useAsyncData, queryCollection } from '#imports'
import type { ContentType } from '~/constants/contentTypes'
import type { FilterState, SortState, TableAuthor, TableContentItem } from '~/types/table'
import { tableParamsSchema } from '~/types/table'
import {
  parseArrayParam,
  applyFiltersExcept,
  buildFilterState,
  applyAllFilters,
  sortItems,
  paginateItems,
  calculateTotalPages,
  isValidColumn,
  isValidDirection,
  buildAuthorMap,
  enrichContentWithAuthors,
} from '~/utils/contentTableLogic'

const PAGE_SIZE = 25

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

  // Build author lookup map using extracted function
  const authorMap = computed(() => {
    if (!rawAuthors.value) return new Map<string, TableAuthor>()
    return buildAuthorMap(rawAuthors.value)
  })

  // Enriched content with author objects using extracted function
  const allContent = computed<TableContentItem[]>(() => {
    if (!rawContent.value) return []
    return enrichContentWithAuthors(rawContent.value, authorMap.value)
  })

  // Client-side filtering using extracted pure functions
  const filteredItems = computed(() => applyAllFilters(allContent.value, filters.value))

  // Client-side sorting using extracted pure function
  const sortedItems = computed(() => {
    const { column, direction } = sort.value
    return sortItems(filteredItems.value, column, direction)
  })

  // Pagination using extracted pure functions
  const paginatedItems = computed(() => paginateItems(sortedItems.value, page.value, PAGE_SIZE))

  const totalPages = computed(() => calculateTotalPages(sortedItems.value.length, PAGE_SIZE))
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
