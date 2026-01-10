# PRD: Table View Improvements

## Introduction

Enhance the content table with multiple view modes and grouping capabilities, inspired by Obsidian Bases. Users will be able to switch between table and card views, and group content by metadata fields (type, year, author) for better organization and discovery.

## Goals

- Add card/grid view as alternative to table view
- Enable grouping content by type, year consumed, or author
- Maintain URL-synced state for shareable links
- Preserve existing filtering and sorting functionality in all views
- Keep implementation lightweight using existing Nuxt UI components

## User Stories

### US-001: Add view toggle component
**Description:** As a user, I want to switch between table and card views so I can choose the layout that works best for my current task.

**Acceptance Criteria:**
- [ ] Segmented control with "Table" and "Cards" options in filter bar
- [ ] Active view stored in URL param (`?view=table` or `?view=cards`)
- [ ] Default to table view when param is missing
- [ ] View toggle preserves all other active filters
- [ ] Typecheck passes
- [ ] Verify in browser

### US-002: Create ContentCards grid view
**Description:** As a user, I want to see content in a card grid layout so I can scan items visually with more context.

**Acceptance Criteria:**
- [ ] Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- [ ] Each card shows: title, type badge, author avatars, tags (max 3), date, rating
- [ ] Cards are clickable to navigate to content
- [ ] Empty state matches table empty state
- [ ] Typecheck passes
- [ ] Verify in browser

### US-003: Add grouping dropdown
**Description:** As a user, I want to group content by a field so I can see related items together.

**Acceptance Criteria:**
- [ ] Dropdown in filter bar with options: None, Type, Year, Author
- [ ] Group selection stored in URL param (`?group=type`)
- [ ] Default to "None" (flat list) when param missing
- [ ] Grouping works with both table and card views
- [ ] Typecheck passes
- [ ] Verify in browser

### US-004: Render grouped table view
**Description:** As a user, I want the table to show section headers when grouping is active so I can see items organized by category.

**Acceptance Criteria:**
- [ ] Collapsible section headers showing group name and item count
- [ ] Items within each group maintain current sort order
- [ ] Empty groups are hidden
- [ ] Section headers are sticky when scrolling within group
- [ ] Typecheck passes
- [ ] Verify in browser

### US-005: Render grouped card view
**Description:** As a user, I want cards to be organized under group headers so I can visually scan by category.

**Acceptance Criteria:**
- [ ] Section headers above each card grid group
- [ ] Cards within group flow in responsive grid
- [ ] Groups sorted: Type (alphabetically), Year (newest first), Author (alphabetically)
- [ ] Group counts shown in headers
- [ ] Typecheck passes
- [ ] Verify in browser

### US-006: Update URL schema and composable
**Description:** As a developer, I need the URL params and composable to support new view/group options.

**Acceptance Criteria:**
- [ ] Add `view` param to `tableParamsSchema` (enum: 'table' | 'cards')
- [ ] Add `group` param to `tableParamsSchema` (enum: 'none' | 'type' | 'year' | 'author')
- [ ] `useContentTable` exposes `view` and `groupBy` refs
- [ ] Add `groupItems()` pure function with unit tests
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add view toggle (Table/Cards) to `ContentTableFiltersBar` component
- FR-2: Create `ContentCardsGrid.vue` component for card view layout
- FR-3: Add grouping dropdown (None/Type/Year/Author) to filter bar
- FR-4: Implement `groupItems(items, groupBy)` function that returns `{ label: string, items: ContentItem[] }[]`
- FR-5: Render grouped sections in both table and card views with collapsible headers
- FR-6: URL params `view` and `group` sync bidirectionally with UI state
- FR-7: Pagination applies to total items before grouping (groups may span pages)
- FR-8: When grouping is active, sort applies within each group

## Non-Goals

- No saved/named views or presets
- No column customization (show/hide columns)
- No inline editing of content
- No drag-and-drop reordering
- No calendar or timeline views
- No calculated/formula fields
- No keyboard navigation improvements (separate PRD)

## Design Considerations

- Reuse existing `ContentCard.vue` component for card grid items
- Use Nuxt UI `UButtonGroup` for view toggle
- Use Nuxt UI `USelectMenu` for grouping dropdown
- Group headers should use existing heading styles
- Card grid should match visual density of `ContentList` component

## Technical Considerations

- `groupItems()` should be a pure function in `useContentTable.ts` for testability
- Group by year extracts year from `date` field (consumed date)
- Group by author uses first author when multiple exist
- Pagination counts total items, not groups
- Consider memoizing group computation for performance

## Success Metrics

- View toggle is discoverable and responsive (< 100ms switch)
- Grouped view helps users find content faster
- URL sharing preserves exact view state
- No performance regression with grouping on 500+ items

## Open Questions

- Should groups be collapsible by default or expanded?
- Should "Group by Author" show author avatar in section header?
- How to handle items with no date when grouping by year? (Show in "Unknown" group?)
