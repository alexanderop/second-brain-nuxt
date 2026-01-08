# PRD: E2E Tests for Keyboard Shortcuts

## Introduction

Add comprehensive end-to-end tests for all keyboard shortcuts to verify they work correctly in the browser. Tests should cover navigation shortcuts (G+X sequences), action shortcuts (J, K, O, A, etc.), and general shortcuts (?, /, Cmd+K, Esc, toggles). Tests will only run on pages where each shortcut is actually active.

## Goals

- Verify all navigation shortcuts (G+H, G+B, G+G, G+T, G+A) navigate to correct pages
- Verify action shortcuts work on applicable pages (note pages, list pages)
- Verify general shortcuts (search modal, shortcuts modal, dark mode, focus mode, TOC toggle)
- Catch regressions when shortcut implementations change
- Use existing content (atomic-habits, 12-design-patterns-in-vue) as test data

## User Stories

### US-001: Navigation shortcut G+H goes home
**Description:** As a user, I press G then H to navigate to the home page from any page.

**Acceptance Criteria:**
- [ ] From /books page, pressing G then H navigates to /
- [ ] URL changes to root path
- [ ] Home page content loads
- [ ] Typecheck passes

### US-002: Navigation shortcut G+B goes to books
**Description:** As a user, I press G then B to navigate to the books page.

**Acceptance Criteria:**
- [ ] From home page, pressing G then B navigates to /books
- [ ] Books page content loads
- [ ] Typecheck passes

### US-003: Navigation shortcut G+G goes to graph
**Description:** As a user, I press G then G to navigate to the graph page.

**Acceptance Criteria:**
- [ ] Pressing G then G navigates to /graph
- [ ] Graph page content loads
- [ ] Typecheck passes

### US-004: Navigation shortcut G+T goes to tags
**Description:** As a user, I press G then T to navigate to the tags page.

**Acceptance Criteria:**
- [ ] Pressing G then T navigates to /tags
- [ ] Tags page content loads
- [ ] Typecheck passes

### US-005: Navigation shortcut G+A goes to authors
**Description:** As a user, I press G then A to navigate to the authors page.

**Acceptance Criteria:**
- [ ] Pressing G then A navigates to /authors
- [ ] Authors page content loads
- [ ] Typecheck passes

### US-006: Action shortcut J/K for list navigation on home page
**Description:** As a user on a list page, I use J to move down and K to move up through items.

**Acceptance Criteria:**
- [ ] On home page, pressing J highlights next content card
- [ ] Pressing K highlights previous content card
- [ ] Visual selection indicator updates correctly
- [ ] Typecheck passes

### US-007: Action shortcut Enter opens selected item
**Description:** As a user, I press Enter to open the currently selected list item.

**Acceptance Criteria:**
- [ ] After selecting item with J, pressing Enter navigates to that note
- [ ] Correct note page loads
- [ ] Typecheck passes

### US-008: Action shortcut O opens resource link (note page)
**Description:** As a user on a note page with a URL, I press O to open the resource link.

**Acceptance Criteria:**
- [ ] On a note with url field (e.g., 12-design-patterns-in-vue), pressing O opens link in new tab
- [ ] Link opens in new browser tab/window
- [ ] Original page remains open
- [ ] Typecheck passes

### US-009: Action shortcut Shift+L copies wiki-link (note page)
**Description:** As a user on a note page, I press Shift+L to copy the wiki-link format.

**Acceptance Criteria:**
- [ ] On note page, pressing Shift+L copies `[[slug]]` to clipboard
- [ ] Clipboard contains correct wiki-link format
- [ ] Typecheck passes

### US-010: Action shortcut Shift+C copies URL (note page)
**Description:** As a user on a note page with a URL, I press Shift+C to copy the URL.

**Acceptance Criteria:**
- [ ] On a note with url field, pressing Shift+C copies URL to clipboard
- [ ] Clipboard contains the note's source URL
- [ ] Typecheck passes

### US-011: General shortcut ? shows shortcuts modal
**Description:** As a user, I press ? to view all available keyboard shortcuts.

**Acceptance Criteria:**
- [ ] Pressing Shift+/ (?) opens shortcuts modal
- [ ] Modal displays all shortcut categories
- [ ] Pressing Escape closes the modal
- [ ] Typecheck passes

### US-012: General shortcut / opens search
**Description:** As a user, I press / to open the search modal.

**Acceptance Criteria:**
- [ ] Pressing / opens search modal
- [ ] Search input is focused
- [ ] Pressing Escape closes the modal
- [ ] Typecheck passes

### US-013: General shortcut Cmd+K opens search
**Description:** As a user, I press Cmd+K (or Ctrl+K) to open the search modal.

**Acceptance Criteria:**
- [ ] Pressing Meta+K opens search modal
- [ ] Search input is focused
- [ ] Typecheck passes

### US-014: General shortcut Escape closes modal
**Description:** As a user, I press Escape to close any open modal.

**Acceptance Criteria:**
- [ ] With search modal open, pressing Escape closes it
- [ ] With shortcuts modal open, pressing Escape closes it
- [ ] Typecheck passes

### US-015: General shortcut Cmd+Alt+T toggles dark mode
**Description:** As a user, I press Cmd+Alt+T to toggle between light and dark mode.

**Acceptance Criteria:**
- [ ] Pressing Meta+Alt+T toggles color mode
- [ ] Page reflects the new color mode (dark/light class changes)
- [ ] Typecheck passes

### US-016: General shortcut Cmd+Shift+\ toggles focus mode
**Description:** As a user, I press Cmd+Shift+\ to toggle focus mode (hide header).

**Acceptance Criteria:**
- [ ] Pressing Meta+Shift+\ hides the header (focus mode)
- [ ] Pressing again shows the header
- [ ] Typecheck passes

### US-017: General shortcut ] toggles table of contents (note page)
**Description:** As a user on a note page, I press ] to toggle the table of contents visibility.

**Acceptance Criteria:**
- [ ] On a note page with TOC, pressing ] toggles TOC visibility
- [ ] TOC appears/disappears correctly
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Create `tests/e2e/shortcuts.spec.ts` for all shortcut tests
- FR-2: Use existing Page Object pattern (HomePage, NotePage, SearchModal)
- FR-3: Test two-key navigation sequences (G+H, G+B, G+G, G+T, G+A)
- FR-4: Test list navigation (J, K, Enter) on home page
- FR-5: Test note page actions (O, A, Shift+L, Shift+C, ]) on note pages
- FR-6: Test modal shortcuts (?, /, Meta+K, Escape) globally
- FR-7: Test toggle shortcuts (Meta+Alt+T for dark mode, Meta+Shift+\ for focus mode)
- FR-8: Use existing content (atomic-habits, 12-design-patterns-in-vue) for note page tests
- FR-9: Author shortcut (A) tests already exist in author-shortcut.spec.ts - skip duplicating

## Non-Goals

- No testing of shortcuts when input fields are focused (expected browser behavior)
- No testing of modifier key edge cases (sticky keys, etc.)
- No mobile/touch testing (shortcuts are desktop-only)
- No duplicate tests for author shortcut (A) - already covered in author-shortcut.spec.ts

## Technical Considerations

- Use `page.keyboard.press()` for single keys and `page.keyboard.press('Meta+k')` for combos
- Two-key sequences (G+H) require sequential `page.keyboard.press('g')` then `page.keyboard.press('h')`
- Clipboard tests may need Playwright's clipboard permissions: `context.grantPermissions(['clipboard-read', 'clipboard-write'])`
- New tab tests need `context.waitForEvent('page')` pattern from author-shortcut.spec.ts
- Color mode toggle can be verified via `document.documentElement.classList.contains('dark')`
- Focus mode can be verified via header visibility

## Success Metrics

- All 17 user stories pass in CI
- No flaky tests (each shortcut triggers reliably)
- Tests complete in under 30 seconds total

## Open Questions

- Should we test shortcuts don't fire when typing in search input? (Standard behavior, may not need explicit test)
