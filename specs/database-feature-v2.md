# Technical Specification: Content Table View (MVP) v2

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
- Column header click → dropdown with filter/sort controls (Obsidian-style)
- Sorting: ascending/descending per column
- Filtering: type (multi-select), tags (multi-select), authors (multi-select), date range (calendar picker), rating (range)
- Row click → navigate to `/[slug]`
- Open in new tab icon per row
- Loading state with skeleton rows
- Empty state when no results match filters
- URL query params to persist filter/sort state (Zod-validated)
- Responsive design (horizontal scroll on mobile, sticky title column)
- Pagination (25 items per page, fixed)
- Full scroll position restoration on browser back
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
| US-03 | As a user, I want to filter by content type so I can focus on just books or podcasts | **Given** I am on the table page **When** I click the "Type" column header **And** select one or more types from the dropdown **Then** only content matching ANY of those types is displayed |
| US-04 | As a user, I want to filter by tags so I can find content on specific topics | **Given** I am on the table page **When** I click the "Tags" column header **And** select one or more tags **Then** only content with at least one matching tag is displayed (OR logic) |
| US-05 | As a user, I want to filter by author so I can see all content from a specific creator | **Given** I am on the table page **When** I click the "Authors" column header **And** search/select one or more authors (shown with avatars) **Then** only content by ANY of those authors is displayed |
| US-06 | As a user, I want to filter by date range so I can find recently consumed or published content | **Given** I am on the table page **When** I click the "Date Consumed" or "Date Published" column header **And** select a date range using the Nuxt UI calendar picker **Then** only content within that range is displayed |
| US-07 | As a user, I want to filter by rating so I can find my highest-rated content | **Given** I am on the table page **When** I click the "Rating" column header **And** set a minimum/maximum rating **Then** only content within that rating range is displayed |
| US-08 | As a user, I want to click a row to view the content detail page | **Given** I am on the table page **When** I click on a table row **Then** I am navigated to `/[slug]` for that content |
| US-09 | As a user, I want to open content in a new tab | **Given** I am on the table page **When** I click the "open in new tab" icon on a row **Then** the content detail page opens in a new browser tab |
| US-10 | As a user, I want filters to persist in the URL so I can share or bookmark filtered views | **Given** I have applied filters **When** I copy the URL **And** paste it in a new tab **Then** the same filters are applied |
| US-11 | As a user, I want invalid URL params to be handled gracefully | **Given** I navigate to `/table?type=invalidType` **When** the page loads **Then** invalid params are stripped silently via Zod validation **And** valid params are applied |
| US-12 | As a user, I want to see a loading state while content loads | **Given** I navigate to `/table` **When** content is being fetched **Then** I see skeleton rows |
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
│       ├── ContentTable.vue         # Reusable table component
│       ├── ContentTableFilter.vue   # Column filter dropdown
│       └── ContentTableHeader.vue   # Sortable/filterable header cell
├── composables/
│   └── useContentTable.ts           # Table state management (shared composable pattern)
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

#### Type Definitions
```typescript
interface ContentItem {
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

type ContentType =
  | 'youtube' | 'podcast' | 'article' | 'book' | 'manga'
  | 'movie' | 'tv' | 'tweet' | 'course' | 'reddit' | 'github'
  | 'quote' | 'note' | 'evergreen' | 'map'

interface Author {
  slug: string
  name: string
  avatar?: string
}

interface FilterState {
  type?: ContentType[]        // OR logic
  tags?: string[]             // OR logic
  authors?: string[]          // Author slugs, OR logic
  dateConsumedRange?: [string, string]   // ISO date strings
  datePublishedRange?: [string, string]  // ISO date strings
  ratingRange?: [number, number]
}

interface SortState {
  column: 'title' | 'type' | 'dateConsumed' | 'datePublished' | 'rating'
  direction: 'asc' | 'desc'
}

// Zod schema for URL param validation
const filterSchema = z.object({
  type: z.array(z.enum([...CONTENT_TYPES])).optional(),
  tags: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  dateConsumedFrom: z.string().datetime().optional(),
  dateConsumedTo: z.string().datetime().optional(),
  datePublishedFrom: z.string().datetime().optional(),
  datePublishedTo: z.string().datetime().optional(),
  ratingMin: z.number().min(1).max(7).optional(),
  ratingMax: z.number().min(1).max(7).optional(),
  sort: z.enum(['title', 'type', 'dateConsumed', 'datePublished', 'rating']).optional(),
  dir: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
})
```

### 5.2 State Management (Shared Composable Pattern)

Following VueUse patterns, `useContentTable` provides reactive state that both the table and headers can read/write:

```typescript
// composables/useContentTable.ts
import { reactive, computed, toRefs, watch } from 'vue'

const state = reactive({
  filters: {} as FilterState,
  sort: { column: 'dateConsumed', direction: 'desc' } as SortState,
  page: 1,
  scrollPosition: 0,
})

export function useContentTable() {
  const { data, pending } = useAsyncData('table-content', () => {
    return queryCollection('content')
      .select(['slug', 'title', 'type', 'authors', 'tags', 'dateConsumed', 'datePublished', 'rating'])
      .all()
  })

  // Filtered and sorted items
  const items = computed(() => {
    let result = data.value ?? []
    result = applyFilters(result, state.filters)
    result = applySort(result, state.sort)
    return result
  })

  // Paginated items
  const paginatedItems = computed(() => {
    const start = (state.page - 1) * 25
    return items.value.slice(start, start + 25)
  })

  // Dynamic filter options (only values in current filtered results)
  const availableTags = computed(() => {
    const filteredWithoutTags = applyFilters(data.value ?? [], { ...state.filters, tags: undefined })
    return [...new Set(filteredWithoutTags.flatMap(i => i.tags ?? []))]
  })

  const availableAuthors = computed(() => {
    const filteredWithoutAuthors = applyFilters(data.value ?? [], { ...state.filters, authors: undefined })
    return [...new Set(filteredWithoutAuthors.flatMap(i => i.authors ?? []))]
  })

  // Methods
  const setFilter = (key: keyof FilterState, value: any) => {
    state.filters[key] = value
    state.page = 1  // Reset pagination on filter change
  }

  const clearFilters = () => {
    state.filters = {}
    state.page = 1
  }

  const setSort = (column: SortState['column'], direction: SortState['direction']) => {
    state.sort = { column, direction }
  }

  const setPage = (page: number) => {
    state.page = page
  }

  const saveScrollPosition = (position: number) => {
    sessionStorage.setItem('table-scroll', String(position))
  }

  const restoreScrollPosition = () => {
    return Number(sessionStorage.getItem('table-scroll') ?? 0)
  }

  return {
    // State (reactive refs)
    ...toRefs(state),

    // Computed
    items,
    paginatedItems,
    pending,
    availableTags,
    availableAuthors,
    totalPages: computed(() => Math.ceil(items.value.length / 25)),
    totalItems: computed(() => items.value.length),

    // Methods
    setFilter,
    clearFilters,
    setSort,
    setPage,
    saveScrollPosition,
    restoreScrollPosition,
  }
}
```

### 5.3 URL Query Parameter Sync

```typescript
// Sync filter/sort state with URL using Zod validation
const route = useRoute()
const router = useRouter()

// Read and validate from URL on mount
onMounted(() => {
  const parsed = filterSchema.safeParse(parseQueryParams(route.query))
  if (parsed.success) {
    // Apply valid params, invalid ones are silently dropped
    Object.assign(state.filters, parsed.data)
  }
})

// Write to URL on change
watch([() => state.filters, () => state.sort, () => state.page], () => {
  router.replace({ query: serializeToQuery(state) })
}, { deep: true })
```

Query parameter format:
```
/table?type=book,podcast&tags=productivity,ai&sort=dateConsumed&dir=desc&page=2
```

### 5.4 Filter Logic

```typescript
function applyFilters(items: ContentItem[], filters: FilterState): ContentItem[] {
  return items.filter(item => {
    // Type filter (OR logic)
    if (filters.type?.length && !filters.type.includes(item.type)) {
      return false
    }

    // Tags filter (OR logic) - exclude items without tags when filter active
    if (filters.tags?.length) {
      if (!item.tags?.length) return false
      if (!filters.tags.some(t => item.tags!.includes(t))) return false
    }

    // Authors filter (OR logic) - exclude items without authors when filter active
    if (filters.authors?.length) {
      if (!item.authors?.length) return false
      const itemAuthorSlugs = item.authors.map(a => a.slug)
      if (!filters.authors.some(a => itemAuthorSlugs.includes(a))) return false
    }

    // Date consumed range - exclude items without dateConsumed when filter active
    if (filters.dateConsumedRange) {
      if (!item.dateConsumed) return false
      const date = new Date(item.dateConsumed)
      const [from, to] = filters.dateConsumedRange.map(d => new Date(d))
      if (date < from || date > to) return false
    }

    // Date published range - exclude items without datePublished when filter active
    if (filters.datePublishedRange) {
      if (!item.datePublished) return false
      const date = new Date(item.datePublished)
      const [from, to] = filters.datePublishedRange.map(d => new Date(d))
      if (date < from || date > to) return false
    }

    // Rating range - exclude items without rating when filter active
    if (filters.ratingRange) {
      if (item.rating === undefined) return false
      const [min, max] = filters.ratingRange
      if (item.rating < min || item.rating > max) return false
    }

    return true
  })
}
```

### 5.5 Table Configuration

```typescript
const columns: TableColumn<ContentItem>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => row.getValue('title'),
    meta: { sticky: true }  // Sticky on mobile
  },
  {
    accessorKey: 'type',
    header: ({ column }) => h(ContentTableHeader, {
      column,
      label: 'Type',
      filterType: 'multi-select',
      filterOptions: CONTENT_TYPES.map(t => ({ value: t, label: t, icon: getTypeIcon(t) })),
      sortable: true
    }),
    cell: ({ row }) => h(UBadge, {
      variant: 'subtle',
      icon: getTypeIcon(row.getValue('type'))
    }, row.getValue('type'))
  },
  {
    accessorKey: 'authors',
    header: ({ column }) => h(ContentTableHeader, {
      column,
      label: 'Authors',
      filterType: 'multi-select-with-avatars',
      sortable: false
    }),
    cell: ({ row }) => h(StackedAvatars, { authors: row.getValue('authors') })
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => h(ContentTableHeader, {
      column,
      label: 'Tags',
      filterType: 'multi-select',
      sortable: false
    }),
    cell: ({ row }) => h(ScrollableTags, { tags: row.getValue('tags') })
  },
  {
    accessorKey: 'dateConsumed',
    header: ({ column }) => h(ContentTableHeader, {
      column,
      label: 'Consumed',
      filterType: 'date-range',
      sortable: true
    }),
    cell: ({ row }) => formatDate(row.getValue('dateConsumed'))
  },
  {
    accessorKey: 'datePublished',
    header: ({ column }) => h(ContentTableHeader, {
      column,
      label: 'Published',
      filterType: 'date-range',
      sortable: true
    }),
    cell: ({ row }) => formatDate(row.getValue('datePublished'))
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => h(ContentTableHeader, {
      column,
      label: 'Rating',
      filterType: 'range',
      filterMin: 1,
      filterMax: 7,
      sortable: true
    }),
    cell: ({ row }) => row.getValue('rating') ?? '—'  // Numeric display
  },
  {
    id: 'actions',
    cell: ({ row }) => h(UButton, {
      icon: 'i-heroicons-arrow-top-right-on-square',
      variant: 'ghost',
      size: 'xs',
      onClick: (e: Event) => {
        e.stopPropagation()
        window.open(`/${row.original.slug}`, '_blank')
      }
    })
  }
]
```

### 5.6 Performance Considerations

| Concern | Solution |
|---------|----------|
| Large dataset (500+ items) | SQLite WASM handles queries efficiently; client-side filtering is fast |
| Initial load | Exclude `body` field from query, fetch metadata only |
| Filter options | Computed with dynamic filtering based on current results |
| Re-renders | Shared composable with Vue reactivity |
| Scroll restoration | sessionStorage for scroll position |

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

### Column Header Dropdown (Obsidian-style)
```
┌──────────────────────┐
│ Sort Ascending    ↑  │
│ Sort Descending   ↓  │
├──────────────────────┤
│ Filter by Type       │
│ ┌──────────────────┐ │
│ │ 📖 ☑ book        │ │
│ │ 🎙 ☑ podcast     │ │
│ │ 📰 ☐ article     │ │
│ │ 📺 ☐ youtube     │ │
│ │ ...              │ │
│ └──────────────────┘ │
├──────────────────────┤
│ Clear filter         │
└──────────────────────┘
```

### Author Filter Dropdown (with avatars)
```
┌──────────────────────┐
│ Filter by Author     │
│ ┌──────────────────┐ │
│ │ 🔍 Search...     │ │
│ │ ● ☑ James Clear  │ │
│ │ ● ☑ Cal Newport  │ │
│ │ ● ☐ Ryan Holiday │ │
│ │ ...              │ │
│ └──────────────────┘ │
├──────────────────────┤
│ Clear filter         │
└──────────────────────┘
```

### Visual Design
- Use existing Nuxt UI components (`UTable`, `UDropdownMenu`, `UBadge`, `UCheckbox`, `UCalendar`)
- Match existing app styling (dark mode support via system preference)
- Type column: colored badges with type icons
- Authors column: stacked avatar circles
- Tags column: horizontally scrollable badge container
- Rating column: numeric value (e.g., "5")
- Title column: sticky on mobile

### Interaction States
- **Hover**: Row highlights on hover (cursor: pointer)
- **Active filter**: Column header shows filter indicator icon, chip appears in active filters bar
- **Active sort**: Column header shows sort direction arrow
- **Loading**: Skeleton rows
- **Empty**: Centered message with "Clear all" button
- **Filter sync**: Bidirectional between chips and dropdowns

---

## 7. Testing Strategy

### Composable Unit Tests (`useContentTable.test.ts`)
- Filter logic: OR combinations, empty results, missing fields excluded
- Sort logic: ascending/descending, null handling
- Pagination: page boundaries, reset on filter change
- URL param sync: serialization/deserialization, Zod validation
- Dynamic filter options: available tags/authors update correctly

### Component Tests (`ContentTable.test.ts`)
- Renders correct columns
- Row click triggers navigation
- Open in new tab button works
- Filter dropdown opens/closes
- Sort indicator displays correctly
- Active filter chips display and remove
- Skeleton loading state
- Empty state message
- Pagination controls

### Integration Tests
- URL params restore filters on page load
- Scroll position restores on browser back
- Filter + sort + pagination work together

---

## 8. Implementation Checklist

### Phase 1: Core Structure
- [ ] Create `app/pages/table.vue` with basic layout
- [ ] Create `useContentTable.ts` composable with shared state pattern
- [ ] Define TypeScript interfaces in `app/types/table.ts`
- [ ] Add Zod schema for URL param validation

### Phase 2: Table Component
- [ ] Implement `ContentTable.vue` with Nuxt UI Table
- [ ] Add skeleton loading state
- [ ] Add empty state with "Clear all" button
- [ ] Implement row click navigation
- [ ] Add "open in new tab" action column

### Phase 3: Column Rendering
- [ ] Title column (sticky on mobile)
- [ ] Type column with icon badges
- [ ] Authors column with stacked avatars
- [ ] Tags column with scrollable container
- [ ] Date Consumed column with formatted dates
- [ ] Date Published column with formatted dates
- [ ] Rating column with numeric display

### Phase 4: Filtering
- [ ] Implement `ContentTableHeader.vue` with dropdown
- [ ] Type filter (multi-select with icons)
- [ ] Tags filter (multi-select, dynamic options)
- [ ] Authors filter (multi-select with avatars, dynamic options)
- [ ] Date Consumed range filter (Nuxt UI calendar)
- [ ] Date Published range filter (Nuxt UI calendar)
- [ ] Rating range filter
- [ ] Active filters chip bar with bidirectional sync
- [ ] "Clear all" functionality

### Phase 5: Sorting
- [ ] Add sorting logic to composable
- [ ] Sort indicators in column headers
- [ ] Sort options in filter dropdown

### Phase 6: State Persistence
- [ ] URL query param sync with Zod validation
- [ ] Scroll position save/restore in sessionStorage

### Phase 7: Pagination
- [ ] Add pagination controls
- [ ] Reset to page 1 on filter change
- [ ] Sync page with URL

### Phase 8: Testing
- [ ] Composable unit tests
- [ ] Component tests
- [ ] Integration tests

### Phase 9: Navigation
- [ ] Add "Table" to top-level nav in `site.config.ts`

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex filter logic bugs | Incorrect results | Comprehensive unit tests for filter combinations |
| URL state sync edge cases | Broken bookmarks | Zod validation strips invalid params silently |
| Mobile usability | Poor touch experience | Sticky title column, horizontal scroll |
| Scroll restoration failures | UX friction | Fallback to top if sessionStorage fails |
| Dynamic filter options performance | Slow dropdowns | Memoize with computed, filter options update lazily |

---

*Spec Version: 2.0*
*Created: January 2026*
*Status: Ready for Implementation*
*Interview Refinements: Filter logic (OR), dual date columns, dynamic filter options, scroll restoration, mobile sticky column, stacked avatars, numeric ratings, skeleton loading, bidirectional filter sync, Zod URL validation*
