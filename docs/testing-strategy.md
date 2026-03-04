# Testing Strategy

This project uses a **3-layer Testing Trophy** approach optimized for fast AI agent feedback and refactoring confidence.

## Test Layers

```text
        ╭──────────────╮
        │     E2E      │  ← Blackbox testing (CI only, ~30s)
        ╰──────────────╯
      ╭──────────────────╮
      │       Nuxt       │  ← Nuxt env + real browser (~5s)
      ╰──────────────────╯
    ╭────────────────────────╮
    │         Unit           │  ← Pure functions, fast (~500ms)
    ╰────────────────────────╯
```

## Commands

| Command | What it runs | When to use |
|---------|-------------|-------------|
| `pnpm test` | Unit + Nuxt + Browser | **Default for AI agents** (~10s) |
| `pnpm test:unit` | Unit tests only | Pure function changes |
| `pnpm test:nuxt` | Nuxt + Browser tests | Component/composable changes |
| `pnpm test:e2e` | Full Playwright E2E | **CI only** (requires build) |

## Test Locations

```text
tests/
├── unit/                # Pure functions, no framework deps
│   ├── utils/           # graph.test.ts, backlinks.test.ts, mentions.test.ts
│   │                    # + property-based tests (*.prop.test.ts)
│   ├── composables/     # useShortcuts.test.ts, useContentTable.test.ts
│   ├── types/           # table.test.ts
│   └── a11y-coverage.test.ts  # Meta-test enforcing a11y coverage
├── nuxt/                # Nuxt context + real browser
│   ├── pages/           # Page-level tests with mocked APIs
│   ├── composables/     # Composables needing Nuxt context
│   ├── components/      # D3 graphs, charts (browser mode)
│   ├── fixtures/        # Shared test data + query builder mocks
│   ├── factories/       # Test data factories
│   ├── utils/           # a11y helpers (vitest-axe)
│   └── a11y.test.ts     # Component-level a11y with axe-core
├── e2e/                 # Playwright blackbox (CI only)
│   ├── *.spec.ts        # User flow tests
│   ├── hydration.spec.ts # Hydration matrix tests
│   ├── pages/           # Page object models
│   └── test-utils.ts    # Extended fixtures (hydration errors)
└── setup/
    └── console-spy.ts   # Catches unexpected console.warn/error
```

## When to Use Each Layer

### Unit Tests (`tests/unit/`)
- Pure utility functions
- Server logic (graph algorithms, backlink parsing, mention detection)
- Type utilities and validators
- Property-based tests with fast-check
- A11y coverage enforcement
- **Target: <500ms total**

```typescript
// tests/unit/utils/graph.test.ts
import { buildGraphFromContent } from '../../../server/utils/graph'

describe('buildGraphFromContent', () => {
  it('creates edges from wiki-links', () => {
    const result = buildGraphFromContent(fixtures.linkedNotes)
    expect(result.edges).toHaveLength(1)
  })
})
```

### Nuxt Tests (`tests/nuxt/`)

The nuxt layer runs two Vitest sub-projects from the same directory:

- **`nuxt` project**: Pages, composables, a11y tests using `environment: 'nuxt'` with `mountSuspended`, `registerEndpoint`, `mockNuxtImport`
- **`nuxt-browser` project**: D3/chart components using real Chromium via Playwright

```typescript
// tests/nuxt/pages/stats.test.ts — uses Nuxt environment
import { registerEndpoint, mountSuspended } from '@nuxt/test-utils/runtime'

describe('Stats Page', () => {
  it('renders stats from API', async () => {
    registerEndpoint('/api/stats', () => fixtures.stats)
    const page = await mountSuspended(StatsPage)
    expect(page.text()).toContain('Total Notes')
  })
})
```

```typescript
// tests/nuxt/components/BaseGraph.test.ts — uses real browser
import { render } from 'vitest-browser-vue'

describe('BaseGraph', () => {
  it('renders graph container', async () => {
    const { container } = render(BaseGraph, { props: { ... } })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
```

#### Mocking queryCollection

Pages using `queryCollection` need `mockNuxtImport` with `vi.hoisted()`:

```typescript
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

const { mockData } = vi.hoisted(() => {
  const holder: { value: ContentFixture[] } = { value: [] }
  return { mockData: holder }
})

mockNuxtImport('queryCollection', () => {
  return () => createQueryCollectionMock(mockData.value)()
})
```

### E2E Tests (`tests/e2e/`)
- Full blackbox user journeys
- Hydration matrix testing (pages × preferences)
- Run against built preview server with real content
- **CI only** - not for local development
- **Target: <30s total**

## New Testing Patterns

### Property-Based Testing (fast-check)

Property tests verify invariants across random inputs. Files use `.prop.test.ts` suffix:

```typescript
// tests/unit/utils/wikilinks.prop.test.ts
import fc from 'fast-check'

it('property: normalizeSlug is idempotent', () => {
  fc.assert(fc.property(fc.string(), (input) => {
    const once = normalizeSlug(input)
    const twice = normalizeSlug(once)
    return once === twice
  }))
})
```

### Console Warning Catching

The `tests/setup/console-spy.ts` setup file intercepts `console.warn` and `console.error` in all unit and nuxt tests. Tests fail if unexpected warnings are logged. Known harmless warnings (e.g., `[intlify]`, `<Suspense>`) are allowlisted.

### Component A11y Testing (axe-core)

`tests/nuxt/a11y.test.ts` mounts each component with minimal props and runs axe-core analysis. Page-level rules (landmark, region, heading) are disabled since components are tested in isolation.

The `tests/unit/a11y-coverage.test.ts` meta-test scans `app/components/` and enforces that every component either has an a11y test or is in the documented skip list. It catches:
- Components missing a11y tests
- Obsolete skip list entries (deleted components)
- Unnecessary skips (components that actually have tests)

### E2E Hydration Matrix Testing

`tests/e2e/hydration.spec.ts` tests key pages under different preference settings for hydration errors. Uses an extended Playwright fixture that captures console messages matching hydration mismatch patterns.

Matrix: 6 pages × 3 preferences = 18 test combinations.

## Key Principles

### 1. Extract Pure Logic for Unit Testing
Server handlers are thin wrappers. Business logic lives in `server/utils/`:

```typescript
// server/api/graph.get.ts - thin wrapper
export default defineEventHandler(async (event) => {
  const allContent = await queryCollection(event, 'content').all()
  return buildGraphFromContent(allContent)  // Pure function → unit testable
})
```

### 2. Use registerEndpoint for Integration
Don't mock `@nuxt/content/server` internals. Mock at the HTTP level:

```typescript
// Good: HTTP-level mocking
registerEndpoint('/api/graph', () => fixtures.graphResponse)

// Bad: Deep internal mocking (fragile)
vi.mock('@nuxt/content/server', () => ({ queryCollection: mockFn }))
```

### 3. AHA Testing (Avoid Hasty Abstractions)

**Avoid mutable variables in tests.** Use setup functions instead of `beforeEach`:

```typescript
// Good: Setup function returns fresh values per test
function setup() {
  const mockFn = vi.fn()
  return { mockFn }
}

it('does something', () => {
  const { mockFn } = setup()
  expect(mockFn).toHaveBeenCalled()
})
```

## Coverage

Coverage tracked for:
- `server/utils/**/*.ts` - All server utilities
- `app/composables/**/*.ts` - Composables
- `app/utils/**/*.ts` - App utilities

Excluded (tested via E2E): Vue-dependent composables, Nitro plugins.

Run: `pnpm test:unit:cov`

## CI Pipeline

```yaml
# Tests run in order of speed
1. pnpm lint          # ~10s
2. pnpm typecheck     # ~20s
3. pnpm test:unit     # ~500ms
4. pnpm test:nuxt     # ~10s (includes Playwright Chromium)
5. pnpm build + pnpm test:e2e  # ~30s
```
