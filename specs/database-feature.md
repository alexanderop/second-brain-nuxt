Got it — column header filters like Obsidian's approach. Click the column header to reveal filter/sort controls for that column.

---

I now have sufficient information to generate the spec. Let me create it:

---

# Technical Specification: Content Table View (MVP)

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
- Table displaying all content items with columns: Title, Type, Authors, Tags, Date, Rating
- Column header click → dropdown with filter/sort controls (Obsidian-style)
- Sorting: ascending/descending per column
- Filtering: type (single-select), tags (multi-select), authors (multi-select), date (range), rating (range)
- Row click → navigate to `/[slug]`
- Loading state while fetching content
- Empty state when no results match filters
- URL query params to persist filter/sort state
- Responsive design (horizontal scroll on mobile)

### Out-of-Scope (Future)
- Card/List/Map view layouts (table only for MVP)
- Write operations (editing content from table)
- Inline row expansion/preview
- Column visibility toggle
- Column reordering/resizing
- Drag-and-drop row reordering
- Embedding component in MDX files (architecture supports it, but not implemented)
- Saved/named views
- Export to CSV

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
| US-01 | As a user, I want to see all my content in a table so I can browse everything at once | **Given** I navigate to `/table` **When** the page loads **Then** I see a table with all content items displayed as rows |
| US-02 | As a user, I want to sort by any column so I can organize content by date, rating, etc. | **Given** I am on the table page **When** I click a column header and select "Sort Ascending" or "Sort Descending" **Then** the table rows reorder accordingly **And** a sort indicator appears on the column header |
| US-03 | As a user, I want to filter by content type so I can focus on just books or podcasts | **Given** I am on the table page **When** I click the "Type" column header **And** select one or more types from the dropdown **Then** only content matching those types is displayed |
| US-04 | As a user, I want to filter by tags so I can find content on specific topics | **Given** I am on the table page **When** I click the "Tags" column header **And** select one or more tags **Then** only content with at least one matching tag is displayed |
| US-05 | As a user, I want to filter by author so I can see all content from a specific creator | **Given** I am on the table page **When** I click the "Authors" column header **And** search/select one or more authors **Then** only content by those authors is displayed |
| US-06 | As a user, I want to filter by date range so I can find recently added content | **Given** I am on the table page **When** I click the "Date" column header **And** set a date range **Then** only content within that range is displayed |
| US-07 | As a user, I want to filter by rating so I can find my highest-rated content | **Given** I am on the table page **When** I click the "Rating" column header **And** set a minimum/maximum rating **Then** only content within that rating range is displayed |
| US-08 | As a user, I want to click a row to view the content detail page | **Given** I am on the table page **When** I click on a table row **Then** I am navigated to `/[slug]` for that content |
| US-09 | As a user, I want filters to persist in the URL so I can share or bookmark filtered views | **Given** I have applied filters **When** I copy the URL **And** paste it in a new tab **Then** the same filters are applied |
| US-10 | As a user, I want to see a loading state while content loads | **Given** I navigate to `/table` **When** content is being fetched **Then** I see a loading indicator |
| US-11 | As a user, I want to see an empty state when no content matches filters | **Given** I have applied filters **When** no content matches **Then** I see a message like "No content matches your filters" |
| US-12 | As a user, I want to clear all filters at once | **Given** I have applied multiple filters **When** I click "Clear filters" **Then** all filters are removed and all content is displayed |

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

#### Type Definitions
```typescript
interface ContentItem {
  slug: string
  title: string
  type: ContentType
  authors?: Author[]
  tags?: string[]
  date?: string
  rating?: number
  url?: string
  cover?: string
}

type ContentType = 
  | 'youtube' | 'podcast' | 'article' | 'book' | 'manga' 
  | 'movie' | 'tv' | 'tweet' | 'course' | 'reddit' | 'github'
  | 'quote' | 'note' | 'evergreen' | 'map'

interface FilterState {
  type?: ContentType[]
  tags?: string[]
  authors?: string[]          // Author slugs
  dateRange?: [string, string] // ISO date strings
  ratingRange?: [number, number]
}

interface SortState {
  column: 'title' | 'type' | 'date' | 'rating'
  direction: 'asc' | 'desc'
}
```

### 5.2 Data Fetching

#### API Endpoint
Use existing `@nuxt/content` queryContent API:

```typescript
// composables/useContentTable.ts
export function useContentTable() {
  const { data, pending } = useAsyncData('table-content', () => {
    return queryContent('/')
      .where({ _extension: 'md' })
      .without(['body'])  // Exclude markdown body for performance
      .find()
  })
  
  // Transform to ContentItem[]
  const items = computed(() => transformContent(data.value))
  
  return { items, pending }
}
```

### 5.3 Table Configuration (TanStack/Nuxt UI)

```typescript
const columns: TableColumn<ContentItem>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => h(ContentTableHeader, { 
      column, 
      label: 'Title',
      filterable: false,  // Title uses global search
      sortable: true 
    }),
    cell: ({ row }) => row.getValue('title')
  },
  {
    accessorKey: 'type',
    header: ({ column }) => h(ContentTableHeader, { 
      column, 
      label: 'Type',
      filterType: 'select',
      filterOptions: CONTENT_TYPES,
      sortable: true 
    }),
    cell: ({ row }) => h(UBadge, { variant: 'subtle' }, row.getValue('type'))
  },
  {
    accessorKey: 'authors',
    header: ({ column }) => h(ContentTableHeader, { 
      column, 
      label: 'Authors',
      filterType: 'multi-select',
      sortable: false 
    }),
    cell: ({ row }) => formatAuthors(row.getValue('authors'))
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => h(ContentTableHeader, { 
      column, 
      label: 'Tags',
      filterType: 'multi-select',
      sortable: false 
    }),
    cell: ({ row }) => formatTags(row.getValue('tags'))
  },
  {
    accessorKey: 'date',
    header: ({ column }) => h(ContentTableHeader, { 
      column, 
      label: 'Date',
      filterType: 'date-range',
      sortable: true 
    }),
    cell: ({ row }) => formatDate(row.getValue('date'))
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
    cell: ({ row }) => formatRating(row.getValue('rating'))
  }
]
```

### 5.4 URL Query Parameter Sync

```typescript
// Sync filter/sort state with URL
const route = useRoute()
const router = useRouter()

// Read from URL on mount
const initialState = computed(() => parseQueryParams(route.query))

// Write to URL on change
watch([filters, sort], ([f, s]) => {
  router.replace({ query: serializeToQuery(f, s) })
}, { deep: true })
```

Query parameter format:
```
/table?type=book,podcast&tags=productivity,ai&sort=date:desc
```

### 5.5 Performance Considerations

| Concern | Solution |
|---------|----------|
| Large dataset (100+ items) | Use TanStack Table virtualization if >500 rows |
| Initial load | Exclude `body` field from query, fetch metadata only |
| Filter options | Compute unique tags/authors from data, memoize with `computed` |
| Re-renders | Use `v-model` bindings for filter state, leverage Vue reactivity |

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
│  ┌─────────┬────────┬─────────┬───────┬────────┬────────┐  │
│  │ Title ▼ │ Type ▼ │ Authors │ Tags  │ Date ▼ │ Rating │  │
│  ├─────────┼────────┼─────────┼───────┼────────┼────────┤  │
│  │ Atomic  │ book   │ James   │ habit │ 2024-  │ ★★★★★  │  │
│  │ Habits  │        │ Clear   │       │ 01-15  │ ★★     │  │
│  ├─────────┼────────┼─────────┼───────┼────────┼────────┤  │
│  │ ...     │ ...    │ ...     │ ...   │ ...    │ ...    │  │
│  └─────────┴────────┴─────────┴───────┴────────┴────────┘  │
│                                                             │
│  Showing 42 of 156 items                    [Pagination]    │
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
│ │ ☑ book           │ │
│ │ ☑ podcast        │ │
│ │ ☐ article        │ │
│ │ ☐ youtube        │ │
│ │ ...              │ │
│ └──────────────────┘ │
├──────────────────────┤
│ Clear filter         │
└──────────────────────┘
```

### Visual Design
- Use existing Nuxt UI components (`UTable`, `UDropdownMenu`, `UBadge`, `UCheckbox`)
- Match existing app styling (dark mode support via system preference)
- Type column: colored badges matching existing type styling
- Rating column: star visualization or numeric display
- Tags column: comma-separated or badge pills (truncate if >3)

### Interaction States
- **Hover**: Row highlights on hover (cursor: pointer)
- **Active filter**: Column header shows filter indicator icon
- **Active sort**: Column header shows sort direction arrow
- **Loading**: Skeleton rows or loading spinner
- **Empty**: Centered message with suggestion to clear filters

---

## 7. Open Questions & Risks

### Open Questions
| # | Question | Decision Needed By | Default Assumption |
|---|----------|-------------------|-------------------|
| 1 | Should pagination be infinite scroll or numbered pages? | Before implementation | Numbered pagination (simpler, matches Nuxt UI examples) |
| 2 | How many items per page? | Before implementation | 25 items per page |
| 3 | Should we show a global search input above the table? | Before implementation | Yes, for quick title/content search |

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with large datasets | Slow rendering, poor UX | Enable virtualization if content exceeds 500 items; paginate by default |
| Complex filter logic | Bugs, unexpected behavior | Write unit tests for filter combinations; use TanStack's built-in filtering |
| URL state sync edge cases | Broken links, lost filters | Test thoroughly with special characters, empty states, invalid values |
| Mobile usability | Table too wide, poor touch targets | Horizontal scroll wrapper; ensure touch-friendly dropdown targets |

---

## 8. Implementation Checklist

- [ ] Create `app/pages/table.vue` with basic layout
- [ ] Create `useContentTable.ts` composable for data fetching
- [ ] Define TypeScript interfaces in `app/types/table.ts`
- [ ] Implement `ContentTable.vue` with Nuxt UI Table
- [ ] Implement `ContentTableHeader.vue` with dropdown filter/sort
- [ ] Add column filtering logic (type, tags, authors)
- [ ] Add date range filtering
- [ ] Add rating range filtering
- [ ] Add sorting functionality
- [ ] Implement URL query param sync
- [ ] Add row click navigation
- [ ] Add loading state
- [ ] Add empty state
- [ ] Add "Clear filters" functionality
- [ ] Add active filters display bar
- [ ] Add pagination
- [ ] Test responsive behavior
- [ ] Add keyboard navigation support
- [ ] Update `site.config.ts` with new nav item

---

*Spec Version: 1.0*
*Created: January 2026*
*Status: Ready for Implementation*