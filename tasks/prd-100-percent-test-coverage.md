# PRD: 100% Unit Test Coverage

## Introduction

Increase unit test coverage from 60% to 100% for the current coverage scope (server/utils + app/composables). This involves refactoring composables to extract pure logic into testable functions and adding missing test cases.

## Goals

- Achieve 100% statement/line coverage for `server/utils/**/*.ts` and `app/composables/**/*.ts`
- Enforce 100% coverage threshold in CI (fail build if coverage drops)
- Maintain the current testing strategy (pure functions tested via unit tests, Vue-dependent code via E2E)
- Keep excluded composables excluded (useBacklinks, useMentions, useListNavigation, usePreferences, useGraphFilters, useSiteConfig, usePageTitle, useFocusMode, useTocVisibility, useTableFilterMenus)

## Current State

| File | Current Coverage | Gap |
|------|-----------------|-----|
| `server/utils/*` | 100% | None |
| `useContentTable.ts` | 26.81% | Lines 127-128, 132-432 |
| `useAuthorShortcut.ts` | 57.14% | Lines 26-39 |
| `useShortcuts.ts` | 80% | Lines 23-24 |

## User Stories

### US-001: Cover getSortValue fallback case
**Description:** As a developer, I want full branch coverage in getSortValue so that all code paths are tested.

**Acceptance Criteria:**
- [ ] Add test case for unknown column returning undefined
- [ ] Line 127-128 covered in coverage report
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-002: Extract filtering logic from useContentTable
**Description:** As a developer, I want filtering logic extracted to pure functions so they can be unit tested independently.

**Acceptance Criteria:**
- [ ] Create `filterByType(items, types)` pure function
- [ ] Create `filterByTags(items, tags)` pure function
- [ ] Create `filterByAuthors(items, authorSlugs)` pure function
- [ ] Create `filterByDateRange(items, range)` pure function
- [ ] Create `filterByRatingRange(items, range)` pure function
- [ ] Create `applyAllFilters(items, filters)` pure function combining all filters
- [ ] Export all functions from useContentTable.ts
- [ ] Update composable to use extracted functions
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-003: Test extracted filtering functions
**Description:** As a developer, I want comprehensive tests for the extracted filtering functions.

**Acceptance Criteria:**
- [ ] Test `filterByType` with empty/single/multiple types
- [ ] Test `filterByTags` with OR logic, items without tags excluded
- [ ] Test `filterByAuthors` with OR logic, items without authors excluded
- [ ] Test `filterByDateRange` with boundary conditions
- [ ] Test `filterByRatingRange` with boundary conditions
- [ ] Test `applyAllFilters` combining multiple filters
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-004: Extract sorting logic from useContentTable
**Description:** As a developer, I want sorting logic extracted to a pure function so it can be unit tested.

**Acceptance Criteria:**
- [ ] Create `sortItems(items, column, direction)` pure function
- [ ] Export function from useContentTable.ts
- [ ] Update composable to use extracted function
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-005: Test extracted sorting function
**Description:** As a developer, I want comprehensive tests for the sorting function.

**Acceptance Criteria:**
- [ ] Test sorting by each column (title, type, dateConsumed, rating)
- [ ] Test ascending vs descending direction
- [ ] Test null values pushed to end
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-006: Extract pagination logic from useContentTable
**Description:** As a developer, I want pagination logic extracted to a pure function.

**Acceptance Criteria:**
- [ ] Create `paginateItems(items, page, pageSize)` pure function
- [ ] Create `calculateTotalPages(totalItems, pageSize)` pure function
- [ ] Export functions from useContentTable.ts
- [ ] Update composable to use extracted functions
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-007: Test extracted pagination functions
**Description:** As a developer, I want comprehensive tests for pagination functions.

**Acceptance Criteria:**
- [ ] Test `paginateItems` for first/middle/last pages
- [ ] Test `paginateItems` with partial last page
- [ ] Test `calculateTotalPages` with exact/partial pages
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-008: Extract validation helpers from useContentTable
**Description:** As a developer, I want validation type guards extracted as pure functions.

**Acceptance Criteria:**
- [ ] Export `isValidColumn(value)` function
- [ ] Export `isValidDirection(value)` function
- [ ] Export `toStringArray(arr)` function
- [ ] Update composable to use exported functions
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-009: Test validation helpers
**Description:** As a developer, I want comprehensive tests for validation helpers.

**Acceptance Criteria:**
- [ ] Test `isValidColumn` with valid/invalid columns
- [ ] Test `isValidDirection` with asc/desc/invalid
- [ ] Test `toStringArray` with arrays/non-arrays/mixed types
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-010: Extract author enrichment logic
**Description:** As a developer, I want author map building and content enrichment extracted as pure functions.

**Acceptance Criteria:**
- [ ] Create `buildAuthorMap(authors)` pure function
- [ ] Create `enrichContentWithAuthors(content, authorMap)` pure function
- [ ] Export functions from useContentTable.ts
- [ ] Update composable to use extracted functions
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-011: Test author enrichment functions
**Description:** As a developer, I want tests for author enrichment logic.

**Acceptance Criteria:**
- [ ] Test `buildAuthorMap` creates correct Map
- [ ] Test `enrichContentWithAuthors` maps author slugs to objects
- [ ] Test fallback for unknown authors
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-012: Cover useAuthorShortcut composable
**Description:** As a developer, I want the useAuthorShortcut composable fully tested.

**Acceptance Criteria:**
- [ ] Mock `window.open` in test setup
- [ ] Test `openAuthor` calls window.open with correct URL
- [ ] Test `handleShortcut` returns correct action type
- [ ] Test `handleShortcut` opens window for single author
- [ ] Test `handleShortcut` returns multiple action without opening window
- [ ] Lines 26-39 covered
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-013: Cover useShortcuts composable
**Description:** As a developer, I want the useShortcutsModal function fully tested.

**Acceptance Criteria:**
- [ ] Add `useShortcutsModal` to mock imports
- [ ] Test `useShortcutsModal` returns a ref with default false value
- [ ] Lines 23-24 covered
- [ ] Typecheck passes
- [ ] `pnpm test:unit` passes

### US-014: Update coverage thresholds to 100%
**Description:** As a developer, I want CI to enforce 100% coverage.

**Acceptance Criteria:**
- [ ] Update `vitest.config.ts` thresholds to 100% for lines, functions, branches, statements
- [ ] Verify `pnpm test:unit` passes with new thresholds
- [ ] Typecheck passes

### US-015: Verify full coverage achieved
**Description:** As a developer, I want to confirm 100% coverage is achieved.

**Acceptance Criteria:**
- [ ] Run `pnpm test:unit --coverage`
- [ ] All files show 100% in coverage report
- [ ] No uncovered lines remain
- [ ] Typecheck passes
- [ ] `pnpm lint:fix && pnpm typecheck` passes

## Functional Requirements

- FR-1: All filtering logic must be extracted to pure, exported functions
- FR-2: All sorting logic must be extracted to pure, exported functions
- FR-3: All pagination logic must be extracted to pure, exported functions
- FR-4: The useContentTable composable must use the extracted pure functions
- FR-5: All extracted functions must have comprehensive unit tests
- FR-6: useAuthorShortcut tests must mock window.open
- FR-7: useShortcuts tests must mock useState
- FR-8: Coverage thresholds must be set to 100% in vitest.config.ts

## Non-Goals

- No changes to excluded composables (useBacklinks, useMentions, etc.)
- No integration or E2E test changes
- No changes to component coverage (not in scope)
- No changes to server/api route coverage (not in scope)
- No refactoring beyond what's needed for testability

## Technical Considerations

- Extracted functions should maintain the same behavior as current inline logic
- Use existing test patterns from `tests/unit/composables/useContentTable.test.ts`
- Mock `window.open` using `vi.stubGlobal('window', { open: vi.fn() })`
- Mock `useState` by extending `tests/mocks/imports.ts`

## Success Metrics

- Coverage report shows 100% for all metrics
- CI fails if coverage drops below 100%
- No regression in existing functionality (all tests pass)
- Composable behavior unchanged (verified by E2E tests)

## Open Questions

None - all clarifying questions answered.
