---
title: "Migrating to Nuxt Test Utils v4 and Vitest v4"
type: note
tags:
  - testing
  - vitest
  - nuxt
  - migration
authors:
  - alexander-opalic
summary: "Nuxt Test Utils v4 requires Vitest v4, a new browser provider package, and careful Vue version alignment to avoid deep DOM type conflicts during typecheck."
date: 2026-02-07
---

I migrated my Nuxt 4 project from `@nuxt/test-utils` v3 + Vitest v3 to v4 of both. The test code needed almost no changes. The type system needed the most attention.

## What Changed

Five dependency updates, one config change, and one import rename across three files.

### Dependencies

| Package | Before | After |
|---------|--------|-------|
| `@nuxt/test-utils` | `^3.21.0` | `^4.0.0` |
| `vitest` | `^3.2.4` | `^4.0.2` |
| `@vitest/coverage-v8` | `^3.2.4` | `^4.0.2` |
| `@vitest/browser` | `3.2.4` | Removed |
| `@vitest/browser-playwright` | — | `^4.0.2` |

Vitest v4 splits the browser provider into a separate package. `@vitest/browser` is gone, replaced by `@vitest/browser-playwright` (or `-webdriverio`, or `-preview`).

### Browser Provider Config

The provider changed from a string to a function call:

```ts
// vitest.config.ts
import { playwright } from '@vitest/browser-playwright' // [!code ++]

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          browser: {
            provider: 'playwright', // [!code --]
            provider: playwright(), // [!code ++]
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
```

### Import Path

Component tests that import from `@vitest/browser/context` need updating:

```ts
import { page } from '@vitest/browser/context' // [!code --]
import { page } from 'vitest/browser' // [!code ++]
```

## What Didn't Change

The biggest improvement in test-utils v4 is that Nuxt initialization moved from `setupFiles` to the `beforeAll` hook. This means `mockNuxtImport` and `vi.mock` calls take effect before Nuxt starts. In practice, this fixed a long-standing issue where mocks for composables used in middleware or plugins wouldn't apply reliably.

My test code needed zero changes because:

- No composables were called at the top level of `describe` blocks (the main breaking change)
- `mockNuxtImport` patterns are backward-compatible
- `registerEndpoint` patterns are backward-compatible
- `vi.hoisted()` patterns still work

If you call composables at the top of a `describe` block, move them into `beforeAll`:

```ts
// Before (worked in vitest v3)
describe('my test', () => {
  const router = useRouter() // [!code --]

  let router: ReturnType<typeof useRouter> // [!code ++]
  beforeAll(() => { // [!code ++]
    router = useRouter() // [!code ++]
  }) // [!code ++]
})
```

## The Hidden Gotcha: Vue Version Alignment

After updating, `pnpm typecheck` failed with deep DOM type errors in a Mermaid component:

```
Type '{ align: string; addEventListener: ... }' is not assignable to type 'HTMLElement'.
```

`HTMLDivElement` wasn't assignable to `HTMLElement`. That should always work since `HTMLDivElement extends HTMLElement`. Something was pulling in two different DOM type definitions.

The root cause: `@nuxt/test-utils` v4.0.0 depends on `vue@3.5.27`, while my project pinned `vue@^3.5.26`. This created two copies of `@vue/runtime-core` in the dependency tree (3.5.26 and 3.5.27), each carrying slightly different DOM type definitions. TypeScript saw them as incompatible types.

The fix was a one-line version bump:

```json
{
  "devDependencies": {
    "vue": "^3.5.26" // [!code --]
    "vue": "^3.5.27" // [!code ++]
  }
}
```

**Tip:** After updating, run `pnpm why @vue/runtime-core` to verify only one version exists in the tree.

## The `.nuxtrc` File

`@nuxt/test-utils` v4 auto-generates a `.nuxtrc` file during install:

```ini
setups.@nuxt/test-utils="4.0.0"
```

Add it to `.gitignore`—it's a local artifact.

## Migration Checklist

1. Update `@nuxt/test-utils`, `vitest`, `@vitest/coverage-v8` to v4
2. Replace `@vitest/browser` with `@vitest/browser-playwright`
3. Change `provider: 'playwright'` to `provider: playwright()` in vitest config
4. Update `@vitest/browser/context` imports to `vitest/browser`
5. Align `vue` version with what `@nuxt/test-utils` v4 requires
6. Add `.nuxtrc` to `.gitignore`
7. Run `nuxt prepare` to regenerate types
8. Run tests and typecheck

## Connections

- [[the-state-of-vitest]] — Vladimir Sheremet's ViteConf 2025 talk covers the Vitest 4 roadmap including the mocking rewrite and browser mode improvements that shipped in this release
- [[vitest-browser-mode]] — Jessica Sachs explains why Vitest browser mode replaces JSDOM, which is the architecture behind the `@vitest/browser-playwright` package used here
- [[vue3-testing-pyramid-vitest-browser-mode]] — My testing strategy article that uses the same three-layer setup (unit, integration, component) this migration applies to
