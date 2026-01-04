# Technical Specification: Content Table View (MVP) v3

## 1. Executive Summary

### Problem
The Second Brain application currently lacks a centralized way to browse, filter, and sort all content in a database-like view. Users must navigate through individual pages or use full-text search to find content, which becomes cumbersome as the knowledge base grows.

### Solution
Create a `/table` page with a reusable Vue component that displays all content in a filterable, sortable table view—inspired by Obsidian Bases. Users can click column headers to reveal filter/sort controls, and clicking a row navigates to the content detail page.

### Value
- **Discoverability**: Quickly scan and find content across the entire knowledge base
- **Organization**: Filter by type, tags, authors, date, or rating to focus on specific subsets
- **Future extensibility**: Component can be reused in MDX files for custom embedded views

---

## 2. Scope

### In-Scope (MVP)
- New `/table` route with full-page table view
- Table displaying all content items with columns: Title, Type, Authors, Tags, Date Consumed, Date Published, Rating
- Column header click → dropdown with filter/sort controls (using Nuxt UI components)
- Sorting: ascending/descending per column (via UTable's TanStack integration)
- Filtering: type (multi-select), tags (multi-select), authors (multi-select with search), date range (calendar picker), rating (range slider)
- Row click → navigate to `/[slug]`
- Open in new tab icon per row
- Loading state with skeleton rows
- Empty state when no results match filters
- URL query params to persist filter/sort state (via VueUse `useRouteQuery` + Zod validation)
- Responsive design (horizontal scroll on mobile, sticky title column via `columnPinning`)
- Pagination (25 items per page, fixed)
- Full scroll position restoration on browser back (via VueUse `useSessionStorage`)
- Top-level navigation item

### Out-of-Scope (Future)
- Card/List/Map view layouts (table only for MVP)
- Global search input (use existing command palette)
- Write operations (editing content from table)
- Inline row expansion/preview
- Column visibility toggle
- Column reordering/resizing
- Drag-and-drop row reordering
- Embedding component in MDX files (architecture supports it, but not implemented)
- Saved/named views
- Export to CSV
- Custom keyboard shortcuts (rely on Nuxt UI defaults)
- Page size selector (fixed at 25)
- Server-side filtering (client-side for MVP, scales to ~500 items)

---

## 3. User Personas

| Persona | Description | Primary Goal |
|---------|-------------|--------------|
| **Knowledge Worker** | Primary user of the Second Brain app. Captures content from various sources and wants to rediscover it later. | Quickly find and filter content by type, author, or tag |
| **Future Self** | The same user returning weeks/months later to find something they saved. | Browse and filter to rediscover forgotten content |

---

## 4. User Stories & Acceptance Criteria

| ID | User Story | Acceptance Criteria (Gherkin) |
|----|------------|-------------------------------|
| US-01 | As a user, I want to see all my content in a table so I can browse everything at once | **Given** I navigate to `/table` **When** the page loads **Then** I see a table with all content items displayed as rows with skeleton loading state while fetching |
| US-02 | As a user, I want to sort by any column so I can organize content by date, rating, etc. | **Given** I am on the table page **When** I click a column header and select "Sort Ascending" or "Sort Descending" **Then** the table rows reorder accordingly **And** a sort indicator appears on the column header |
| US-03 | As a user, I want to filter by content type so I can focus on just books or podcasts | **Given** I am on the table page **When** I click the "Type" column header **And** select one or more types from the checkbox list **Then** only content matching ANY of those types is displayed |
| US-04 | As a user, I want to filter by tags so I can find content on specific topics | **Given** I am on the table page **When** I click the "Tags" column header **And** select one or more tags **Then** only content with at least one matching tag is displayed (OR logic) |
| US-05 | As a user, I want to filter by author so I can see all content from a specific creator | **Given** I am on the table page **When** I click the "Authors" column header **And** search/select one or more authors **Then** only content by ANY of those authors is displayed |
| US-06 | As a user, I want to filter by date range so I can find recently consumed or published content | **Given** I am on the table page **When** I click the "Date Consumed" or "Date Published" column header **And** select a date range using the calendar picker **Then** only content within that range is displayed |
| US-07 | As a user, I want to filter by rating so I can find my highest-rated content | **Given** I am on the table page **When** I click the "Rating" column header **And** set a minimum/maximum rating via slider **Then** only content within that rating range is displayed |
| US-08 | As a user, I want to click a row to view the content detail page | **Given** I am on the table page **When** I click on a table row **Then** I am navigated to `/[slug]` for that content |
| US-09 | As a user, I want to open content in a new tab | **Given** I am on the table page **When** I click the "open in new tab" icon on a row **Then** the content detail page opens in a new browser tab |
| US-10 | As a user, I want filters to persist in the URL so I can share or bookmark filtered views | **Given** I have applied filters **When** I copy the URL **And** paste it in a new tab **Then** the same filters are applied |
| US-11 | As a user, I want invalid URL params to be handled gracefully | **Given** I navigate to `/table?type=invalidType` **When** the page loads **Then** invalid params are stripped silently via Zod validation **And** valid params are applied |
| US-12 | As a user, I want to see a loading state while content loads | **Given** I navigate to `/table` **When** content is being fetched **Then** I see skeleton rows via UTable's `loading` prop |
| US-13 | As a user, I want to see an empty state when no content matches filters | **Given** I have applied filters **When** no content matches **Then** I see a message "No content matches your filters" with a "Clear all" button |
| US-14 | As a user, I want to clear all filters at once | **Given** I have applied multiple filters **When** I click "Clear filters" **Then** all filters are removed, pagination resets to page 1, and all content is displayed |
| US-15 | As a user, I want filter options to be dynamic | **Given** I have filtered by type "book" **When** I open the Tags filter dropdown **Then** I only see tags that exist on books (not all tags in the system) |
| US-16 | As a user, I want to navigate back and restore my exact position | **Given** I was on page 2 of results, scrolled halfway down **When** I click a row, then press browser back **Then** I return to page 2 at the same scroll position |
| US-17 | As a user on mobile, I want to scroll horizontally while keeping context | **Given** I am viewing the table on mobile **When** I scroll horizontally **Then** the Title column remains sticky on the left |

---

## 5. Technical Requirements

### 5.1 Frontend Architecture

#### New Files
```
app/
├── pages/
│   └── table.vue                    # Main table page
├── components/
│   └── content/
│       └── ContentTable.vue         # Reusable table component
├── composables/
│   └── useContentTable.ts           # Table state management
└── types/
    └── table.ts                     # TypeScript interfaces
```

#### Component: `ContentTable.vue`
```typescript
// Props
interface ContentTableProps {
  data?: ContentItem[]           // Optional: pass data directly (for MDX embedding)
  initialFilters?: FilterState   // Optional: preset filters
  initialSort?: SortState        // Optional: preset sort
}

// Emits
interface ContentTableEmits {
  (e: 'row-click', item: ContentItem): void
}
```

#### Type Definitions (`app/types/table.ts`)
```typescript
import { z } from 'zod'

// Content types from your schema
export const CONTENT_TYPES = [
  'youtube', 'podcast', 'article', 'book', 'manga',
  'movie', 'tv', 'tweet', 'course', 'reddit', 'github',
  'quote', 'note', 'evergreen', 'map'
] as const

export type ContentType = typeof CONTENT_TYPES[number]

export interface ContentItem {
  slug: string
  title: string
  type: ContentType
  authors?: Author[]
  tags?: string[]
  dateConsumed?: string    // ISO date string
  datePublished?: string   // ISO date string
  rating?: number          // 1-7 scale
  url?: string
  cover?: string
}

export interface Author {
  slug: string
  name: string
  avatar?: string
}

export interface FilterState {
  type?: ContentType[]        // OR logic
  tags?: string[]             // OR logic
  authors?: string[]          // Author slugs, OR logic
  dateConsumedRange?: [string, string]   // ISO date strings
  datePublishedRange?: [string, string]  // ISO date strings
  ratingRange?: [number, number]
}

export interface SortState {
  column: 'title' | 'type' | 'dateConsumed' | 'datePublished' | 'rating'
  direction: 'asc' | 'desc'
}

// Zod schema for URL param validation
export const filterSchema = z.object({
  type: z.array(z.enum(CONTENT_TYPES)).optional(),
  tags: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  dateConsumedFrom: z.string().optional(),
  dateConsumedTo: z.string().optional(),
  datePublishedFrom: z.string().optional(),
  datePublishedTo: z.string().optional(),
  ratingMin: z.coerce.number().min(1).max(7).optional(),
  ratingMax: z.coerce.number().min(1).max(7).optional(),
  sort: z.enum(['title', 'type', 'dateConsumed', 'datePublished', 'rating']).optional(),
  dir: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
})
```

### 5.2 State Management with VueUse

Following existing patterns in `useGraphFilters.ts`, use `useRouteQuery` for URL sync:

```typescript
// composables/useContentTable.ts
import { useRouteQuery } from '@vueuse/router'
import { useSessionStorage, useScroll, watchThrottled } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import type { ContentItem, FilterState, SortState } from '~/types/table'
import { filterSchema, CONTENT_TYPES } from '~/types/table'

export function useContentTable() {
  // URL params with VueUse
  const typeParam = useRouteQuery<string | string[] | null>('type')
  const tagsParam = useRouteQuery<string | string[] | null>('tags')
  const authorsParam = useRouteQuery<string | string[] | null>('authors')
  const dateConsumedFromParam = useRouteQuery('dateConsumedFrom')
  const dateConsumedToParam = useRouteQuery('dateConsumedTo')
  const datePublishedFromParam = useRouteQuery('datePublishedFrom')
  const datePublishedToParam = useRouteQuery('datePublishedTo')
  const ratingMinParam = useRouteQuery('ratingMin')
  const ratingMaxParam = useRouteQuery('ratingMax')
  const sortParam = useRouteQuery('sort', 'dateConsumed')
  const dirParam = useRouteQuery('dir', 'desc')
  const pageParam = useRouteQuery('page', '1')

  // Helper to normalize array params
  const normalizeArray = (val: string | string[] | null): string[] | undefined => {
    if (!val) return undefined
    if (Array.isArray(val)) return val.length ? val : undefined
    return val.split(',').filter(Boolean)
  }

  // Validated filters from URL
  const filters = computed<FilterState>(() => {
    const raw = {
      type: normalizeArray(typeParam.value),
      tags: normalizeArray(tagsParam.value),
      authors: normalizeArray(authorsParam.value),
      dateConsumedFrom: dateConsumedFromParam.value || undefined,
      dateConsumedTo: dateConsumedToParam.value || undefined,
      datePublishedFrom: datePublishedFromParam.value || undefined,
      datePublishedTo: datePublishedToParam.value || undefined,
      ratingMin: ratingMinParam.value ? Number(ratingMinParam.value) : undefined,
      ratingMax: ratingMaxParam.value ? Number(ratingMaxParam.value) : undefined,
    }
    const parsed = filterSchema.safeParse(raw)
    if (!parsed.success) return {}

    const data = parsed.data
    return {
      type: data.type,
      tags: data.tags,
      authors: data.authors,
      dateConsumedRange: data.dateConsumedFrom && data.dateConsumedTo
        ? [data.dateConsumedFrom, data.dateConsumedTo]
        : undefined,
      datePublishedRange: data.datePublishedFrom && data.datePublishedTo
        ? [data.datePublishedFrom, data.datePublishedTo]
        : undefined,
      ratingRange: data.ratingMin !== undefined && data.ratingMax !== undefined
        ? [data.ratingMin, data.ratingMax]
        : undefined,
    }
  })

  const sort = computed<SortState>(() => ({
    column: (sortParam.value as SortState['column']) || 'dateConsumed',
    direction: (dirParam.value as SortState['direction']) || 'desc',
  }))

  const page = computed({
    get: () => parseInt(pageParam.value || '1') || 1,
    set: (v) => { pageParam.value = String(v) }
  })

  // Fetch all content metadata (no body)
  const { data: allContent, pending } = useAsyncData('table-content', () => {
    return queryCollection('content')
      .select('slug', 'title', 'type', 'authors', 'tags', 'date', 'datePublished', 'rating')
      .all()
  })

  // Client-side filtering
  const filteredItems = computed(() => {
    let result = allContent.value ?? []
    const f = filters.value

    // Type filter (OR)
    if (f.type?.length) {
      result = result.filter(item => f.type!.includes(item.type))
    }

    // Tags filter (OR) - exclude items without tags when filter active
    if (f.tags?.length) {
      result = result.filter(item => {
        if (!item.tags?.length) return false
        return f.tags!.some(t => item.tags!.includes(t))
      })
    }

    // Authors filter (OR) - exclude items without authors when filter active
    if (f.authors?.length) {
      result = result.filter(item => {
        if (!item.authors?.length) return false
        const slugs = item.authors.map(a => a.slug)
        return f.authors!.some(a => slugs.includes(a))
      })
    }

    // Date consumed range
    if (f.dateConsumedRange) {
      const [from, to] = f.dateConsumedRange.map(d => new Date(d))
      result = result.filter(item => {
        if (!item.date) return false
        const date = new Date(item.date)
        return date >= from && date <= to
      })
    }

    // Date published range
    if (f.datePublishedRange) {
      const [from, to] = f.datePublishedRange.map(d => new Date(d))
      result = result.filter(item => {
        if (!item.datePublished) return false
        const date = new Date(item.datePublished)
        return date >= from && date <= to
      })
    }

    // Rating range
    if (f.ratingRange) {
      const [min, max] = f.ratingRange
      result = result.filter(item => {
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
      let aVal = a[column === 'dateConsumed' ? 'date' : column]
      let bVal = b[column === 'dateConsumed' ? 'date' : column]

      // Handle nulls (push to end)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Compare
      let cmp = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal)
      } else {
        cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      }

      return direction === 'asc' ? cmp : -cmp
    })

    return items
  })

  // Pagination
  const PAGE_SIZE = 25
  const paginatedItems = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE
    return sortedItems.value.slice(start, start + PAGE_SIZE)
  })
  const totalPages = computed(() => Math.ceil(sortedItems.value.length / PAGE_SIZE))
  const totalItems = computed(() => sortedItems.value.length)

  // Dynamic filter options (based on current filtered results, excluding self)
  const availableTags = computed(() => {
    const itemsWithoutTagFilter = applyFiltersExcept(allContent.value ?? [], filters.value, 'tags')
    return [...new Set(itemsWithoutTagFilter.flatMap(i => i.tags ?? []))].sort()
  })

  const availableAuthors = computed(() => {
    const itemsWithoutAuthorFilter = applyFiltersExcept(allContent.value ?? [], filters.value, 'authors')
    const authors = itemsWithoutAuthorFilter.flatMap(i => i.authors ?? [])
    const uniqueBySlug = [...new Map(authors.map(a => [a.slug, a])).values()]
    return uniqueBySlug.sort((a, b) => a.name.localeCompare(b.name))
  })

  // Filter setters
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

  const setDatePublishedRange = (range: [string, string] | null) => {
    datePublishedFromParam.value = range?.[0] ?? null
    datePublishedToParam.value = range?.[1] ?? null
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
    datePublishedFromParam.value = null
    datePublishedToParam.value = null
    ratingMinParam.value = null
    ratingMaxParam.value = null
    pageParam.value = '1'
  }

  const hasActiveFilters = computed(() => {
    const f = filters.value
    return !!(
      f.type?.length ||
      f.tags?.length ||
      f.authors?.length ||
      f.dateConsumedRange ||
      f.datePublishedRange ||
      f.ratingRange
    )
  })

  // Scroll position restoration
  const scrollPosition = useSessionStorage('table-scroll', 0)

  return {
    // Data
    items: paginatedItems,
    pending,
    totalItems,
    totalPages,

    // Filter state
    filters,
    hasActiveFilters,
    availableTags,
    availableAuthors,

    // Sort state
    sort,

    // Pagination
    page,

    // Actions
    setTypeFilter,
    setTagsFilter,
    setAuthorsFilter,
    setDateConsumedRange,
    setDatePublishedRange,
    setRatingRange,
    setSort,
    clearFilters,

    // Scroll restoration
    scrollPosition,
  }
}

// Helper: apply all filters except one (for dynamic options)
function applyFiltersExcept(
  items: ContentItem[],
  filters: FilterState,
  exclude: keyof FilterState
): ContentItem[] {
  // ... same filter logic but skip the excluded filter
}
```

### 5.3 Scroll Position Restoration

```typescript
// In table.vue or ContentTable.vue
const { scrollPosition } = useContentTable()
const tableRef = ref<HTMLElement>()
const { y } = useScroll(tableRef)

// Save scroll position (throttled)
watchThrottled(y, (pos) => {
  scrollPosition.value = pos
}, { throttle: 100 })

// Restore on mount
onMounted(() => {
  if (scrollPosition.value > 0) {
    nextTick(() => {
      tableRef.value?.scrollTo(0, scrollPosition.value)
    })
  }
})
```

### 5.4 UTable Configuration

```typescript
import type { TableColumn } from '@nuxt/ui'

const columns: TableColumn<ContentItem>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 250,  // Required for columnPinning
  },
  {
    accessorKey: 'type',
    header: 'Type',
    size: 120,
    cell: ({ row }) => h(UBadge, {
      variant: 'subtle',
      color: getTypeColor(row.getValue('type')),
      icon: getTypeIcon(row.getValue('type'))
    }, () => row.getValue('type'))
  },
  {
    accessorKey: 'authors',
    header: 'Authors',
    size: 150,
    cell: ({ row }) => {
      const authors = row.getValue('authors') as Author[]
      if (!authors?.length) return '—'
      return h(UAvatarGroup, { max: 3, size: 'xs' }, () =>
        authors.map(a => h(UAvatar, { src: a.avatar, alt: a.name }))
      )
    }
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    size: 200,
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[]
      if (!tags?.length) return '—'
      return h('div', { class: 'flex gap-1 overflow-x-auto' },
        tags.slice(0, 3).map(t => h(UBadge, { variant: 'soft', size: 'xs' }, () => t))
      )
    }
  },
  {
    accessorKey: 'date',  // dateConsumed
    header: 'Consumed',
    size: 110,
    cell: ({ row }) => formatDate(row.getValue('date'))
  },
  {
    accessorKey: 'datePublished',
    header: 'Published',
    size: 110,
    cell: ({ row }) => formatDate(row.getValue('datePublished'))
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 80,
    cell: ({ row }) => row.getValue('rating') ?? '—'  // Numeric display
  },
  {
    id: 'actions',
    size: 50,
    cell: ({ row }) => h(UButton, {
      icon: 'i-lucide-external-link',
      variant: 'ghost',
      size: 'xs',
      onClick: (e: Event) => {
        e.stopPropagation()
        window.open(`/${row.original.slug}`, '_blank')
      }
    })
  }
]

// UTable props
const tableConfig = {
  columns,
  columnPinning: { left: ['title'] },  // Sticky on mobile
  loading: pending.value,
}
```

### 5.5 Column Header Filter Dropdowns

Using UDropdownMenu with checkbox items for type filter:

```vue
<template #type-header="{ column }">
  <UDropdownMenu :items="typeFilterItems">
    <UButton variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down">
      Type
      <UIcon v-if="filters.type?.length" name="i-lucide-filter" class="ml-1 text-primary" />
    </UButton>
  </UDropdownMenu>
</template>
```

```typescript
const typeFilterItems = computed(() => [[
  { type: 'label' as const, label: 'Sort' },
  {
    label: 'Ascending',
    icon: 'i-lucide-arrow-up',
    onSelect: () => setSort('type', 'asc')
  },
  {
    label: 'Descending',
    icon: 'i-lucide-arrow-down',
    onSelect: () => setSort('type', 'desc')
  },
], [
  { type: 'label' as const, label: 'Filter by Type' },
  ...CONTENT_TYPES.map(t => ({
    type: 'checkbox' as const,
    label: t,
    icon: getTypeIcon(t),
    checked: filters.value.type?.includes(t) ?? false,
    onUpdateChecked: (checked: boolean) => {
      const current = filters.value.type ?? []
      const next = checked
        ? [...current, t]
        : current.filter(x => x !== t)
      setTypeFilter(next)
    }
  })),
], [
  {
    label: 'Clear filter',
    icon: 'i-lucide-x',
    disabled: !filters.value.type?.length,
    onSelect: () => setTypeFilter([])
  }
]])
```

### 5.6 Author Filter with Search

Using USelectMenu for searchable multi-select:

```vue
<template #authors-header>
  <UPopover>
    <UButton variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down">
      Authors
      <UIcon v-if="filters.authors?.length" name="i-lucide-filter" class="ml-1 text-primary" />
    </UButton>
    <template #content>
      <div class="p-2 w-64">
        <USelectMenu
          v-model="selectedAuthors"
          :items="availableAuthors"
          multiple
          searchable
          placeholder="Search authors..."
          value-key="slug"
          label-key="name"
        >
          <template #item="{ item }">
            <UAvatar :src="item.avatar" size="2xs" class="mr-2" />
            {{ item.name }}
          </template>
        </USelectMenu>
      </div>
    </template>
  </UPopover>
</template>
```

### 5.7 Date Range Filter

Using UPopover + UCalendar:

```vue
<template #date-header>
  <UPopover>
    <UButton variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down">
      Consumed
      <UIcon v-if="filters.dateConsumedRange" name="i-lucide-filter" class="ml-1 text-primary" />
    </UButton>
    <template #content="{ close }">
      <div class="p-2">
        <UCalendar
          v-model="dateConsumedRange"
          range
          :number-of-months="2"
        />
        <div class="flex justify-end gap-2 mt-2">
          <UButton variant="ghost" size="xs" @click="setDateConsumedRange(null); close()">
            Clear
          </UButton>
          <UButton size="xs" @click="close()">Apply</UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
```

### 5.8 Rating Range Filter

Using USlider:

```vue
<template #rating-header>
  <UPopover>
    <UButton variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down">
      Rating
      <UIcon v-if="filters.ratingRange" name="i-lucide-filter" class="ml-1 text-primary" />
    </UButton>
    <template #content>
      <div class="p-4 w-48">
        <div class="text-sm mb-2">Rating: {{ ratingRange[0] }} - {{ ratingRange[1] }}</div>
        <USlider
          v-model="ratingRange"
          :min="1"
          :max="7"
          :step="1"
        />
        <div class="flex justify-end mt-2">
          <UButton variant="ghost" size="xs" @click="setRatingRange(null)">Clear</UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
```

### 5.9 Active Filters Bar

```vue
<div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mb-4">
  <!-- Type chips -->
  <UBadge
    v-for="type in filters.type"
    :key="type"
    variant="soft"
    class="cursor-pointer"
    @click="setTypeFilter(filters.type!.filter(t => t !== type))"
  >
    {{ type }}
    <UIcon name="i-lucide-x" class="ml-1" />
  </UBadge>

  <!-- Tags chips -->
  <UBadge
    v-for="tag in filters.tags"
    :key="tag"
    variant="soft"
    color="green"
    class="cursor-pointer"
    @click="setTagsFilter(filters.tags!.filter(t => t !== tag))"
  >
    {{ tag }}
    <UIcon name="i-lucide-x" class="ml-1" />
  </UBadge>

  <!-- ... other filter chips ... -->

  <UButton variant="ghost" size="xs" @click="clearFilters">
    Clear all
  </UButton>
</div>
```

### 5.10 Pagination

```vue
<div class="flex items-center justify-between mt-4">
  <div class="text-sm text-muted">
    Showing {{ (page - 1) * 25 + 1 }}-{{ Math.min(page * 25, totalItems) }} of {{ totalItems }} items
  </div>
  <UPagination
    v-model:page="page"
    :total="totalItems"
    :items-per-page="25"
    :sibling-count="1"
    show-edges
  />
</div>
```

### 5.11 Database Indexes (Recommended)

Add to `content.config.ts` for optimized queries:

```typescript
defineCollection({
  type: 'page',
  source: '**/*.md',
  schema: z.object({ ... }),
  indexes: [
    { columns: ['type'] },
    { columns: ['date'] },
    { columns: ['type', 'date'] },
  ]
})
```

### 5.12 Performance Considerations

| Concern | Solution |
|---------|----------|
| Large dataset (500+ items) | Client-side filtering is fast; consider virtualization for 1000+ |
| Initial load | Exclude `body` field via `.select()` |
| Filter options | Computed with dynamic filtering based on current results |
| Re-renders | VueUse composables are optimized |
| Scroll restoration | sessionStorage via `useSessionStorage` |
| URL updates | `useRouteQuery` uses `router.replace` (no history pollution) |

---

## 6. Design & UX Notes

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Table                              [Search] [Nav]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Active Filters: [Type: book ×] [Tags: ai ×]  Clear  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────┬────────┬─────────┬───────┬────────┬────────┬────────┬───┐
│  │ Title   │ Type ▼ │ Authors │ Tags  │Consumed│Published│ Rating │   │
│  ├─────────┼────────┼─────────┼───────┼────────┼────────┼────────┼───┤
│  │ Atomic  │ 📖book │ ●●      │ habit │ 2024-  │ 2018-  │ 5      │ ↗ │
│  │ Habits  │        │         │ prod  │ 01-15  │ 10-16  │        │   │
│  ├─────────┼────────┼─────────┼───────┼────────┼────────┼────────┼───┤
│  │ ...     │ ...    │ ...     │ ...   │ ...    │ ...    │ ...    │   │
│  └─────────┴────────┴─────────┴───────┴────────┴────────┴────────┴───┘
│                                                             │
│  Showing 1-25 of 156 items                    [< 1 2 3 >]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design
- Use existing Nuxt UI components (UTable, UDropdownMenu, UBadge, USelectMenu, UCalendar, USlider)
- Match existing app styling (dark mode support via system preference)
- Type column: colored badges with type icons
- Authors column: UAvatarGroup with `max={3}`
- Tags column: horizontally scrollable badge container
- Rating column: numeric value (e.g., "5" or "—")
- Title column: sticky on mobile via `columnPinning`

### Interaction States
- **Hover**: Row highlights on hover (cursor: pointer)
- **Active filter**: Column header shows filter indicator icon, chip appears in active filters bar
- **Active sort**: Column header shows sort direction arrow
- **Loading**: Skeleton rows via UTable's `loading` prop
- **Empty**: `#empty` slot with "Clear all" button
- **Filter sync**: Bidirectional between chips and dropdowns

---

## 7. Testing Strategy

### Composable Unit Tests (`useContentTable.test.ts`)
- Filter logic: OR combinations, empty results, missing fields excluded
- Sort logic: ascending/descending, null handling
- Pagination: page boundaries, reset on filter change
- URL param sync via `useRouteQuery`: serialization, Zod validation
- Dynamic filter options: available tags/authors update correctly

### Component Tests (`ContentTable.test.ts`)
- Renders correct columns
- Row click triggers navigation
- Open in new tab button works
- Filter dropdown opens/closes
- Sort indicator displays correctly
- Active filter chips display and remove
- Skeleton loading state via `loading` prop
- Empty state message via `#empty` slot
- Pagination controls

### Integration Tests
- URL params restore filters on page load
- Scroll position restores on browser back
- Filter + sort + pagination work together

---

## 8. Implementation Checklist

### Phase 1: Core Structure
- [ ] Create `app/pages/table.vue` with UTable
- [ ] Create `useContentTable.ts` with `useRouteQuery` for URL sync
- [ ] Define TypeScript interfaces in `app/types/table.ts`
- [ ] Add Zod schema for URL param validation
- [ ] Add indexes to `content.config.ts`

### Phase 2: Table Component
- [ ] Configure UTable with column definitions
- [ ] Set `columnPinning: { left: ['title'] }` with `size` on columns
- [ ] Add `loading` state with skeleton
- [ ] Add `#empty` slot with "Clear all" button
- [ ] Implement `@select` for row navigation
- [ ] Add "open in new tab" action column

### Phase 3: Column Rendering
- [ ] Title column (sticky on mobile)
- [ ] Type column with UBadge + icon
- [ ] Authors column with UAvatarGroup
- [ ] Tags column with scrollable container
- [ ] Date Consumed column with formatted dates
- [ ] Date Published column with formatted dates
- [ ] Rating column with numeric display

### Phase 4: Column Header Filters
- [ ] Type: UDropdownMenu with checkboxes + sort options
- [ ] Authors: UPopover + USelectMenu with avatars, search, multiple
- [ ] Tags: UDropdownMenu with checkboxes (dynamic options)
- [ ] Date Consumed: UPopover + UCalendar (range, 2 months)
- [ ] Date Published: UPopover + UCalendar (range, 2 months)
- [ ] Rating: UPopover + USlider for range

### Phase 5: Active Filters Bar
- [ ] Chips for each active filter (type, tags, authors, dates, rating)
- [ ] Bidirectional sync with dropdowns
- [ ] "Clear all" button

### Phase 6: State Management
- [ ] `useRouteQuery` for all filter/sort/page params
- [ ] Zod validation with silent stripping of invalid params
- [ ] `useSessionStorage` for scroll position
- [ ] `useScroll` + `watchThrottled` for scroll tracking

### Phase 7: Pagination
- [ ] UPagination with `itemsPerPage`, `total`, `v-model:page`
- [ ] Reset to page 1 on filter change

### Phase 8: Testing
- [ ] Composable unit tests
- [ ] Component tests
- [ ] Integration tests

### Phase 9: Navigation
- [ ] Add "Table" to `site.config.ts` navigation

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex filter logic bugs | Incorrect results | Comprehensive unit tests for filter combinations |
| URL state sync edge cases | Broken bookmarks | Zod validation strips invalid params silently |
| Mobile usability | Poor touch experience | Sticky title column via `columnPinning`, horizontal scroll |
| Scroll restoration failures | UX friction | Fallback to top if sessionStorage fails |
| Dynamic filter options performance | Slow dropdowns | Computed values update lazily |
| UTable column pinning | Requires explicit `size` | Document requirement, add `size` to all columns |

---

*Spec Version: 3.0*
*Created: January 2026*
*Status: Ready for Implementation*
*Changes from v2: VueUse composables (useRouteQuery, useSessionStorage, useScroll), Nuxt UI patterns (UTable TanStack, UDropdownMenu checkboxes, UCalendar range, USlider), database indexes, numeric rating display, improved code examples*
