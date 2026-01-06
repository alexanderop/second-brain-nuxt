# Testing Strategy

This project uses a **4-layer Testing Trophy** approach optimized for fast AI agent feedback and refactoring confidence.

## Test Layers

```text
        ╭──────────────╮
        │     E2E      │  ← Blackbox testing (CI only, ~30s)
        ╰──────────────╯
       ╭────────────────╮
       │   Component    │  ← Real browser for D3/visuals (~5s)
       ╰────────────────╯
      ╭──────────────────╮
      │   Integration    │  ← Nuxt context + registerEndpoint (~3s)
      ╰──────────────────╯
    ╭────────────────────────╮
    │         Unit           │  ← Pure functions, fast (~100ms)
    ╰────────────────────────╯
```

## Commands

| Command | What it runs | When to use |
|---------|-------------|-------------|
| `pnpm test` | Unit + Integration | **Default for AI agents** (~3.5s) |
| `pnpm test:unit` | Unit tests only | Pure function changes |
| `pnpm test:integration` | Integration tests | Component/composable changes |
| `pnpm test:component` | Browser component tests | D3/chart changes |
| `pnpm test:e2e` | Full Playwright E2E | **CI only** (requires build) |

## Test Locations

```text
tests/
├── unit/              # Pure functions, no framework deps
│   ├── utils/         # graph.test.ts, backlinks.test.ts, mentions.test.ts
│   ├── composables/   # useShortcuts.test.ts
│   └── types/         # table.test.ts
├── integration/       # Nuxt context + registerEndpoint
│   ├── api/           # API route integration tests
│   ├── pages/         # Page component tests
│   └── fixtures/      # Shared test data
├── component/         # Real browser for visuals
│   ├── components/    # D3 graphs, charts
│   └── factories/     # Test data factories
└── e2e/               # Playwright blackbox (CI only)
    ├── *.spec.ts      # User flow tests
    └── pages/         # Page object models
```

## When to Use Each Layer

### Unit Tests (`tests/unit/`)
- Pure utility functions
- Server logic (graph algorithms, backlink parsing, mention detection)
- Type utilities and validators
- **Target: <100ms total**

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

### Integration Tests (`tests/integration/`)
- **API Routes**: Use `registerEndpoint` with real server utils to test HTTP contract
- **Page Components**: Use `registerEndpoint` to mock HTTP, test component rendering
- Composables needing Nuxt context
- **Target: <3s total**

#### API Integration Tests

Use server utils directly to create realistic responses, then test HTTP contract:

```typescript
// tests/integration/api/graph.test.ts
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { buildGraphFromContent } from '~/server/utils/graph'
import { linkedNotes } from '../fixtures/content'

describe('/api/graph integration', () => {
  it('returns graph structure', async () => {
    // Use real server util to build response
    const graphData = buildGraphFromContent(linkedNotes)
    registerEndpoint('/api/graph', () => graphData)

    const response = await $fetch('/api/graph')

    // Test HTTP contract
    expect(response).toHaveProperty('nodes')
    expect(response).toHaveProperty('edges')
  })
})
```

#### Page Component Tests

Use `registerEndpoint` for page components to isolate UI testing:

```typescript
// tests/integration/pages/stats.test.ts
import { registerEndpoint, mountSuspended } from '@nuxt/test-utils/runtime'
import { simpleStats } from '../fixtures'
import StatsPage from '~/pages/stats.vue'

describe('Stats Page', () => {
  it('renders stats data', async () => {
    registerEndpoint('/api/stats', () => simpleStats)
    const page = await mountSuspended(StatsPage)
    expect(page.text()).toContain('Total Notes')
  })
})
```

### Component Tests (`tests/component/`)
- D3.js visualizations (BaseGraph)
- Chart components (StatsBarChart, StatsLineChart)
- Anything requiring real browser DOM
- Uses Playwright through Vitest
- **Target: <5s total**

### E2E Tests (`tests/e2e/`)
- Full blackbox user journeys
- Run against built preview server with real content
- **CI only** - not for local development
- **Target: <30s total**

## Key Principles

### 1. Extract Pure Logic for Unit Testing
Server handlers are thin wrappers. Business logic lives in `server/utils/`:

```typescript
// server/api/graph.get.ts - thin wrapper
import { buildGraphFromContent } from '../utils/graph'

export default defineEventHandler(async (event) => {
  const allContent = await queryCollection(event, 'content').all()
  return buildGraphFromContent(allContent)  // Pure function
})
```

### 2. Mock at the Right Layer

**For API Integration Tests**: Use server utils with `registerEndpoint` to test HTTP contract:

```typescript
// Good: Use real server util + HTTP-level mocking
import { buildGraphFromContent } from '~/server/utils/graph'
const graphData = buildGraphFromContent(fixtures)
registerEndpoint('/api/graph', () => graphData)

// Also good: Server utils are tested separately at unit level
// tests/unit/utils/graph.test.ts tests buildGraphFromContent thoroughly
```

**For Page Component Tests**: Use `registerEndpoint` to isolate UI testing:

```typescript
// Good: HTTP-level mocking (tests component in isolation)
registerEndpoint('/api/stats', () => fixtures.stats)
const page = await mountSuspended(StatsPage)
```

### 3. E2E Tests Real Content
E2E tests run against your actual knowledge base. They verify:
- Pages load correctly
- Wiki-links navigate
- Search finds content
- Content renders properly

### 4. Test Integration, Not Implementation
Integration tests verify the contract between layers:
- **API tests**: Content → queryCollection → handler → utils → response
- **Page tests**: HTTP mock → component → rendered output
- Don't test `@nuxt/content` internals (SQLite, minimark parsing, etc.)

## Coverage

Coverage tracked for:
- `server/**/*.ts` - All server code including utils
- `app/composables/**/*.ts` - Composables

Excluded (tested via E2E):
- Vue-dependent composables (useBacklinks, useMentions)
- Nitro plugins (logic extracted to server/utils)

Run: `pnpm test:unit:cov`

## Writing New Tests

1. **Default to unit tests** - Extract pure functions, test in isolation
2. **Integration for Nuxt context** - Use registerEndpoint when components need API data
3. **Component tests for visuals** - Only for D3, charts, DOM-dependent code
4. **E2E sparingly** - Critical user paths only, run in CI

## CI Pipeline

```yaml
# Tests run in order of speed
1. pnpm typecheck        # ~20s
2. pnpm test:unit        # ~100ms
3. pnpm test:integration # ~3s
4. pnpm test:component   # ~5s
5. pnpm build + pnpm test:e2e  # ~30s
```

## E2E Debugging Tips

### Connection Refused Errors

If E2E tests fail with `net::ERR_CONNECTION_REFUSED`:

1. **Check for stale servers** - A previous process may be blocking port 3000:
   ```bash
   lsof -i :3000  # Find process
   kill <PID>     # Remove it
   ```

2. **Verify build works** - Run `pnpm build && pnpm preview` manually to check for build errors.

### Nuxt UI Component Selectors

Nuxt UI components use Reka UI internally. Some selector gotchas:

| Component | What doesn't work | What works |
|-----------|------------------|------------|
| `UCommandPalette` | `getByRole('combobox', { name: /search/i })` | `getByPlaceholder(/search/i)` |

**Why:** The input's `placeholder` attribute isn't treated as an ARIA accessible name. Use `getByPlaceholder()` instead of `getByRole()` with name matching.
