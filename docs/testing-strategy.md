# Testing Strategy

This project uses a **Testing Trophy** approach with multiple test layers optimized for speed and confidence.

## Test Layers

```text
        ╭──────────────╮
        │     E2E      │  ← Slow, high confidence (CI only)
        ╰──────────────╯
       ╭────────────────╮
       │   Component    │  ← Isolated components in real browser
       ╰────────────────╯
      ╭──────────────────╮
      │   Integration    │  ← Full Nuxt environment
      ╰──────────────────╯
    ╭────────────────────────╮
    │      Unit + API        │  ← Fast, isolated (~500ms)
    ╰────────────────────────╯
```

## Commands

| Command | What it runs | When to use |
|---------|-------------|-------------|
| `pnpm test:unit` | Unit + API unit tests | **Default for local dev** |
| `pnpm test:integration` | Nuxt environment tests | Testing composables |
| `pnpm test:component` | Isolated component tests | Testing D3/chart components |
| `pnpm test:e2e` | Full Playwright E2E | **CI only** (requires build) |

## Test Locations

```text
tests/
├── unit/           # Pure functions, no framework deps
│   ├── utils/      # wikilinks.test.ts, text.test.ts
│   └── composables/# useShortcuts.test.ts
├── api-unit/       # Server logic with mocked deps
│   ├── graph.test.ts
│   └── backlinks.test.ts
├── nuxt/           # Full Nuxt environment (*.nuxt.test.ts)
│   └── api/        # API route integration tests
├── component/      # Isolated components in real browser
│   └── components/ # D3 graphs, charts
└── e2e/            # Playwright E2E (CI only)
```

## When to Use Each Layer

### Unit Tests (`tests/unit/`)
- Pure utility functions
- Logic that doesn't need Vue/Nuxt runtime
- Fast, ~50ms per test

```typescript
// tests/unit/utils/wikilinks.test.ts
describe('normalizeSlug', () => {
  it('converts to lowercase', () => {
    expect(normalizeSlug('MyNote')).toBe('mynote')
  })
})
```

### API Unit Tests (`tests/api-unit/`)
- Server API logic with mocked dependencies
- Test graph algorithms, backlink parsing
- No network, no database

### Nuxt Integration Tests (`tests/nuxt/`)
- Composables that need Nuxt context
- API routes with real Nuxt/Content runtime
- Uses `*.nuxt.test.ts` suffix

### Component Tests (`tests/component/`)
- Isolated components that need real DOM (D3.js graphs)
- Chart components (StatsBarChart, StatsLineChart)
- Uses Playwright browser through Vitest

### E2E Tests (`tests/e2e/`)
- Full user flows
- Run against built preview server
- **Only run in CI** (slow, requires build)

## Coverage

Coverage is tracked for:
- `server/**/*.ts` - All server code
- `app/composables/**/*.ts` - Composables

Excluded (tested via integration/E2E):
- Vue-dependent composables (useBacklinks, useMentions)
- Nitro plugins

Run: `pnpm test:unit:cov`

## Writing New Tests

1. **Start with unit tests** - Can you test in isolation?
2. **Mock dependencies** - Use api-unit for server logic
3. **Nuxt tests only when needed** - For composables requiring context
4. **Component tests for visuals** - D3, charts, DOM-dependent code
5. **E2E sparingly** - Critical user paths only

## CI Pipeline

```yaml
# Tests run in order of speed
1. pnpm typecheck        # ~20s - catches app/server context violations
2. pnpm test:unit        # ~500ms
3. pnpm test:integration # ~5s
4. pnpm test:component   # ~10s
5. pnpm test:e2e         # ~30s (after build)
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

The Playwright `webServer` config handles server startup, but it can't start if the port is occupied.

### Nuxt UI Component Selectors

Nuxt UI components use Reka UI internally. Some selector gotchas:

| Component | What doesn't work | What works |
|-----------|------------------|------------|
| `UCommandPalette` | `getByRole('combobox', { name: /search/i })` | `getByPlaceholder(/search/i)` |

**Why:** The input's `placeholder` attribute isn't treated as an ARIA accessible name. Use `getByPlaceholder()` instead of `getByRole()` with name matching.
