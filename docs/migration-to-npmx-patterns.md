# Migration Plan: Align second-brain-nuxt with npmx.dev Patterns

> **Update (2026-03):** The project has since migrated to **Vite+** (`vp` CLI) as the unified toolchain. Many of the individual tool configurations described below (vitest.config.ts, .oxlintrc.json, simple-git-hooks + lint-staged) have been consolidated into `vite.config.ts`. Key command mappings:
>
> | Before                                | After        |
> | ------------------------------------- | ------------ |
> | `oxlint`                              | `vp lint`    |
> | `oxfmt`                               | `vp fmt`     |
> | `vitest run`                          | `vp test`    |
> | `pnpm install --frozen-lockfile` (CI) | `vp install` |
>
> `vitest.config.ts` was merged into `vite.config.ts`, `.oxlintrc.json` was merged into the `vite.config.ts` lint block, and `simple-git-hooks` + `lint-staged` were replaced by the `staged` block in `vite.config.ts`. The tickets below retain their historical descriptions for context.

## Overview

This document outlines a structured migration of `second-brain-nuxt` to follow the code patterns, testing structure, and tooling conventions established in `npmx.dev`. The goal is to adopt the mature engineering patterns from npmx without changing the project's visual identity or functionality.

### Guiding Constraints

- **Keep Tailwind CSS and @nuxt/ui** -- do not switch to UnoCSS
- **Keep Zod** -- it is integral to `content.config.ts` and the content validation pipeline
- **Keep custom ESLint plugins** -- `frontmatter`, `error-handling`, and `nuxt-content` have no oxlint equivalent
- **Keep `tryCatch` error handling pattern** -- it is a deliberate project convention
- **Keep auto-imports disabled** -- this is a deliberate project choice for explicit dependency tracking
- **Keep Stryker mutation testing** -- npmx does not have it, but it is a valuable addition here

### Priority Legend

| Priority | Meaning                                                       |
| -------- | ------------------------------------------------------------- |
| P0       | Critical path -- do first, other tickets may depend on it     |
| P1       | High value -- significant improvement to DX or CI reliability |
| P2       | Nice to have -- cleanup and polish                            |

### Effort Legend

| Size | Meaning                                                |
| ---- | ------------------------------------------------------ |
| S    | A few hours, mostly mechanical renames or config edits |
| M    | Half a day to a day, requires testing and verification |
| L    | One to two days, involves structural reorganization    |

---

## Migration Tickets

### Ticket 1: Test Directory Restructure

**Priority**: P0
**Estimated Effort**: M
**Description**: Rename the test directory from `tests/` to `test/` and rename all `*.test.ts` files to `*.spec.ts` to match the npmx convention. Reorganize sub-directories to consolidate factories, mocks, fixtures, and test utilities under a unified layout.

**Current structure**:

```text
tests/
  unit/
    composables/
    utils/
    types/
    a11y-coverage.test.ts
  nuxt/
    pages/
    composables/
    components/
    fixtures/        # <-- already exists inside nuxt/
    factories/       # <-- also inside nuxt/
    utils/
    a11y.test.ts
    setup.ts
    browser-setup.ts
  e2e/               # Playwright -- already uses *.spec.ts, leave as-is
    pages/
    utils/
  factories/
    contentFactory.ts
  mocks/
    imports.ts
  setup/
    console-spy.ts
```

**Target structure**:

```text
test/
  unit/
    composables/
    utils/
    types/
    a11y-coverage.spec.ts
  nuxt/
    pages/
    composables/
    components/
    a11y.spec.ts
    setup.ts
    browser-setup.ts
  e2e/               # Playwright tests stay *.spec.ts -- no change to filenames
    pages/
    utils/
  fixtures/          # Consolidated: merge tests/nuxt/fixtures/ + tests/factories/
    content.ts
    backlinks.ts
    graph.ts
    mentions.ts
    note-graph.ts
    query-builder.ts
    raw-content.ts
    search.ts
    stats.ts
    chartFactory.ts
    graphFactory.ts
    contentFactory.ts
    index.ts
  test-utils/        # Consolidated: merge tests/mocks/ + tests/nuxt/utils/ + tests/setup/
    imports-mock.ts   # renamed from mocks/imports.ts
    a11y.ts           # from nuxt/utils/a11y.ts
    console-spy.ts    # from setup/console-spy.ts
```

**Changes**:

1. **Rename directory**: `mv tests/ test/`
2. **Rename all `*.test.ts` files to `*.spec.ts`** in `test/unit/` and `test/nuxt/` (35 files). The E2E tests already use `*.spec.ts`.
3. **Consolidate `test/fixtures/`**: Move `tests/nuxt/fixtures/*` and `tests/factories/*` into `test/fixtures/`. Move `tests/nuxt/factories/*` (chartFactory.ts, graphFactory.ts) into the same directory.
4. **Consolidate `test/test-utils/`**: Move `tests/mocks/imports.ts` to `test/test-utils/imports-mock.ts`. Move `tests/nuxt/utils/a11y.ts` to `test/test-utils/a11y.ts`. Move `tests/setup/console-spy.ts` to `test/test-utils/console-spy.ts`.
5. **Update all import paths** in test files that reference the moved utilities, fixtures, and mocks.
6. **Update `vitest.config.ts`**: Change all `tests/` references to `test/` and `*.test.ts` globs to `*.spec.ts`.
7. **Update `playwright.config.ts`**: Change `testDir` from `./tests/e2e` to `./test/e2e`.
8. **Update `.oxlintrc.json`**: Change the override glob from `**/*.test.ts` to `**/*.spec.ts` and `**/tests/**` to `**/test/**`.
9. **Update `stryker.config.json`**: If vitest.stryker.config.ts references `tests/`, update it.
10. **Update `knip.ts`**: Change `!tests/**` to `!test/**`.
11. **Update `eslint.config.js`**: No changes needed (it does not reference the test directory directly).
12. **Update `.gitignore`** if it references `tests/`.
13. **Update `CLAUDE.md`** and `docs/testing-strategy.md`\*\* to reflect the new directory name.

**Acceptance Criteria**:

- [ ] `test/` directory exists; `tests/` does not
- [ ] All Vitest test files use `*.spec.ts` naming
- [ ] `pnpm test:unit` passes with the new paths
- [ ] `pnpm test:nuxt` passes with the new paths
- [ ] `pnpm test:e2e` passes with the new paths
- [ ] `pnpm knip` reports no new issues from the rename
- [ ] No stale `tests/` references remain anywhere in the codebase (search for `tests/` in all config files)

---

### Ticket 2: Vitest Config Alignment

> **Note:** `vitest.config.ts` has been merged into `vite.config.ts` as part of the Vite+ migration. Tests now run via `vp test` instead of `vitest run`.

**Priority**: P1
**Estimated Effort**: M
**Description**: Simplify the Vitest configuration from 3 projects to 2 (unit + nuxt-with-browser), align coverage reporting with npmx patterns by adding JUNIT XML output for CI, and clean up coverage exclusions.

**Current state**:

- 3 projects: `unit` (node), `nuxt` (nuxt env), `nuxt-browser` (Playwright browser)
- Coverage: v8 with `text` and `html` reporters, 100% thresholds
- No JUNIT reporting for CI integration

**Target state**:

- 2 projects: `unit` (node), `nuxt` (nuxt env with Playwright browser capabilities)
- Coverage: v8 with `text`, `html`, and `junit` reporters
- JUNIT XML output at `./coverage/junit.xml` for Codecov integration

**Changes**:

1. **`vitest.config.ts`** -- Merge `nuxt` and `nuxt-browser` into a single `nuxt` project:

   ```ts
   // Option A: Keep 2 separate projects if merging is not feasible due to
   // environment differences (nuxt env vs raw browser). In that case, just
   // rename 'nuxt-browser' to 'browser' for clarity.
   //
   // Option B (preferred): If @nuxt/test-utils supports browser mode,
   // configure the nuxt project to handle both integration and browser tests.
   ```

   Investigate whether `defineVitestProject` from `@nuxt/test-utils/config` supports `browser` options. If not, keep 2 projects but rename `nuxt-browser` to `browser` for consistency with npmx's naming.

2. **Add JUNIT reporter** to coverage config:

   ```ts
   reporter: ['text', 'html', 'junit'],
   ```

3. **Add `reportsDirectory`** explicit path: `./coverage` (already set, confirm).

4. **Add JUNIT test reporter** for CI:

   ```ts
   // In the top-level test config:
   reporters: process.env.CI
     ? ['default', ['junit', { outputFile: './test-results/junit.xml' }]]
     : ['default'],
   ```

5. **Update `package.json` scripts** -- Add a `test:unit:ci` script that includes coverage and JUNIT output (or handle via CI workflow directly).

**Acceptance Criteria**:

- [ ] Vitest config has 2 projects (or 2 clearly named projects if merge is infeasible)
- [ ] `pnpm test:unit:cov` generates JUNIT XML alongside text/html reports
- [ ] CI workflow can consume the JUNIT XML for Codecov
- [ ] All existing tests still pass
- [ ] 100% coverage thresholds remain enforced

---

### Ticket 3: oxlint Config Enhancement

> **Note:** `.oxlintrc.json` has been merged into the lint block in `vite.config.ts` as part of the Vite+ migration. Linting now runs via `vp lint` instead of `oxlint`.

**Priority**: P1
**Estimated Effort**: M
**Description**: Expand `.oxlintrc.json` from 37 rules to a comprehensive config that matches npmx's 113-line configuration. Add missing plugins and strict rules for test code quality, modern JS patterns, and regex safety.

**Current plugins**: `typescript`, `import`, `unicorn` (3 plugins, ~20 rules)
**Target plugins**: `typescript`, `import`, `unicorn`, `vitest`, `oxc`, `vue`, `regexp`, `e18e` (8 plugins)

**Changes to `.oxlintrc.json`**:

1. **Add `vitest` plugin** with test quality rules:

   ```json
   "vitest/no-disabled-tests": "warn",
   "vitest/no-focused-tests": "error",
   "vitest/expect-expect": "error",
   "vitest/no-identical-title": "error",
   "vitest/valid-expect": "error",
   "vitest/no-standalone-expect": "error",
   "vitest/prefer-to-be": "warn"
   ```

2. **Add `oxc` plugin** with code quality rules:

   ```json
   "oxc/no-optional-chaining": "off",
   "oxc/no-const-enum": "error",
   "oxc/no-accumulating-spread": "warn"
   ```

3. **Add `vue` plugin** rules (complement ESLint vue rules that oxlint can handle faster):

   ```json
   "vue/no-dupe-keys": "error",
   "vue/no-duplicate-attributes": "error",
   "vue/no-template-shadow": "error"
   ```

4. **Add `regexp` plugin** for regex safety:

   ```json
   "regexp/no-dupe-disjunctions": "error",
   "regexp/no-empty-alternative": "warn",
   "regexp/no-empty-capturing-group": "error",
   "regexp/no-lazy-ends": "warn",
   "regexp/no-optional-assertion": "error",
   "regexp/no-potentially-useless-backreference": "warn",
   "regexp/no-super-linear-backtracking": "error",
   "regexp/no-useless-assertions": "error",
   "regexp/no-misleading-capturing-group": "warn",
   "regexp/strict": "error"
   ```

5. **Add `e18e` plugin** (es-tooling ecosystem interop rules):

   ```json
   "e18e/no-top-level-await": "off"
   ```

   Include the plugin primarily for future rules as the ecosystem grows.

6. **Add additional strict rules** from npmx:

   ```json
   "no-alert": "error",
   "no-caller": "error",
   "no-constructor-return": "error",
   "no-iterator": "error",
   "no-multi-str": "error",
   "no-new-wrappers": "error",
   "no-proto": "error",
   "no-restricted-globals": "error",
   "no-self-compare": "error",
   "no-template-curly-in-string": "error",
   "no-unmodified-loop-condition": "error",
   "no-unreachable-loop": "error",
   "no-useless-concat": "error",
   "prefer-rest-params": "error",
   "prefer-spread": "error",
   "prefer-template": "error",
   "radix": "error",
   "symbol-description": "error",
   "unicorn/prefer-array-flat-map": "error",
   "unicorn/prefer-string-starts-ends-with": "error",
   "unicorn/throw-new-error": "error",
   "unicorn/prefer-type-error": "error",
   "import/no-named-as-default": "warn",
   "import/no-named-as-default-member": "warn"
   ```

7. **Update overrides** -- Change `**/*.test.ts` glob to `**/*.spec.ts` (dependent on Ticket 1).

**Acceptance Criteria**:

- [ ] `.oxlintrc.json` includes all 8 plugins
- [ ] `pnpm lint:ox` passes with zero errors on current codebase (fix any new violations)
- [ ] New rules do not produce false positives on existing code
- [ ] Overrides properly relax rules for test files

---

### Ticket 4: CI/CD Pipeline Modernization

> **Note:** CI now uses `vp install` instead of `pnpm install --frozen-lockfile`, and `vp lint`/`vp test`/`vp fmt` instead of their standalone equivalents.

**Priority**: P1
**Estimated Effort**: L
**Description**: Modernize the CI pipeline to match npmx patterns: add Codecov integration, optimize job parallelism, add ARM runner support, and separate the browser test job from nuxt integration tests.

**Current CI jobs**: lint, typecheck, test-unit, test-nuxt, build, test-e2e (needs build), knip, lighthouse (needs build)
**Target CI jobs**: lint, types, unit, nuxt, browser, build, e2e (needs build), knip, lighthouse (needs build)

**Changes to `.github/workflows/ci.yml`**:

1. **Concurrency groups** -- Already present. Verify `cancel-in-progress: true` is set (it is).

2. **Split test-nuxt into two jobs**:
   - `nuxt` -- Runs `vitest run --project nuxt` (integration tests, no browser needed)
   - `browser` -- Runs `vitest run --project browser` (D3/visual component tests, needs Playwright)

   This eliminates Playwright install overhead for pure integration tests.

3. **Add Codecov upload** to the `unit` job:

   ```yaml
   - name: Run unit tests with coverage
     run: pnpm test:unit:cov

   - name: Upload coverage to Codecov
     uses: codecov/codecov-action@v5
     with:
       files: ./coverage/junit.xml
       flags: unit
       fail_ci_if_error: false
   ```

4. **Consider ARM runners** (`ubuntu-24.04-arm`):
   - ARM runners are cheaper and faster for Node.js workloads
   - Requires verifying all dependencies (sharp, better-sqlite3, Playwright) work on ARM
   - **Recommendation**: Start with `ubuntu-24.04-arm` for lint, types, knip (no native deps). Keep x64 for build, test, and Playwright jobs until ARM compatibility is confirmed.

   ```yaml
   lint:
     runs-on: ubuntu-24.04-arm # ARM for faster lint
   ```

5. **Add timeout-minutes** to all jobs for safety:

   ```yaml
   test-unit:
     timeout-minutes: 5
   test-nuxt:
     timeout-minutes: 10
   browser:
     timeout-minutes: 10
   ```

6. **Add `format:check`** to the lint job to catch unformatted code:

   ```yaml
   - name: Check formatting
     run: pnpm format:check
   ```

7. **Rename `typecheck` job** to `types` for consistency with npmx naming.

**Acceptance Criteria**:

- [ ] CI has separate `nuxt` and `browser` jobs
- [ ] Codecov integration uploads coverage on unit test job
- [ ] All jobs have explicit timeout-minutes
- [ ] Format check runs as part of lint
- [ ] ARM runners used where compatible (lint, types, knip at minimum)
- [ ] Pipeline wall-clock time is equal or better than current

---

### Ticket 5: Lighthouse CI Improvement

**Priority**: P2
**Estimated Effort**: M
**Description**: Enhance Lighthouse CI configuration to match npmx patterns: add dark/light mode matrix testing, auto-detect Chrome executable, add performance audits alongside a11y, and test more representative pages.

**Current state**:

- `lighthouserc.json` -- Tests 2 URLs, a11y only, desktop preset, 1 run
- Score threshold: 0.9 for accessibility

**Target state**:

- `.lighthouserc.cjs` (JS for dynamic Chrome detection)
- Tests 4+ URLs across dark and light modes
- Both a11y and performance categories
- Auto-detect Chrome from Playwright or system install

**Changes**:

1. **Convert `lighthouserc.json` to `.lighthouserc.cjs`**:

   ```js
   const { execSync } = require("node:child_process");

   function findChrome() {
     try {
       // Try Playwright's Chrome first
       const result = execSync("npx playwright install --dry-run chromium", {
         encoding: "utf8",
       });
       // Parse browser path from output, or fall back
     } catch {
       // Fall back to system Chrome paths
     }
     return undefined; // Let Lighthouse find Chrome itself
   }

   module.exports = {
     ci: {
       collect: {
         url: [
           "http://localhost:3000/",
           "http://localhost:3000/books",
           "http://localhost:3000/graph",
           "http://localhost:3000/table",
         ],
         startServerCommand: "node .output/server/index.mjs",
         startServerReadyPattern: "Listening on",
         numberOfRuns: 1,
         settings: {
           onlyCategories: ["accessibility", "performance"],
           preset: "desktop",
           chromeFlags: ["--no-sandbox"],
           chromePath: findChrome(),
         },
       },
       assert: {
         assertions: {
           "categories:accessibility": ["error", { minScore: 0.9 }],
           "categories:performance": ["warn", { minScore: 0.7 }],
         },
       },
       upload: {
         target: "temporary-public-storage",
       },
     },
   };
   ```

2. **Add dark mode testing** in CI workflow (matrix strategy):

   ```yaml
   lighthouse:
     name: Lighthouse (${{ matrix.theme }})
     runs-on: ubuntu-latest
     needs: build
     strategy:
       matrix:
         theme: [light, dark]
     steps:
       # ... setup steps ...
       - name: Run Lighthouse CI
         uses: treosh/lighthouse-ci-action@v12
         env:
           COLOR_SCHEME: ${{ matrix.theme }}
         with:
           configPath: ./.lighthouserc.cjs
   ```

   The `.lighthouserc.cjs` would inject `--force-prefers-color-scheme` Chrome flag based on the `COLOR_SCHEME` env var.

3. **Delete `lighthouserc.json`** and update CI workflow to reference `.lighthouserc.cjs`.

4. **Update test URLs** to include more representative pages (graph, table, tags).

**Acceptance Criteria**:

- [ ] Lighthouse runs in both dark and light mode
- [ ] Performance category is audited (warn threshold, not blocking)
- [ ] At least 4 URLs tested
- [ ] Chrome auto-detection works in CI
- [ ] Old `lighthouserc.json` is removed
- [ ] CI workflow updated to reference `.lighthouserc.cjs`

---

### Ticket 6: Extract Reusable Nuxt Modules

**Priority**: P2
**Estimated Effort**: L
**Description**: Identify self-contained features that can be extracted into local Nuxt modules under a `modules/` directory, following npmx's pattern of modular feature organization. This improves maintainability and makes features independently testable.

**Candidates for extraction**:

| Module                   | Current Location                           | What It Does                                         |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------- |
| `modules/wiki-links/`    | `nuxt.config.ts` hooks + `server/plugins/` | Wiki-link transformation in content pipeline         |
| `modules/pwa/`           | `nuxt.config.ts` pwa section               | PWA manifest, workbox config, service worker         |
| `modules/content-hooks/` | `nuxt.config.ts` hooks                     | Content file transformation (Excalidraw, wiki-links) |
| `modules/seo/`           | `nuxt.config.ts` app.head + routeRules     | SEO meta, robots, prerender config                   |

**Recommended first extraction -- `modules/wiki-links/`**:

1. Create `modules/wiki-links/index.ts`:

   ```ts
   import { defineNuxtModule } from "@nuxt/kit";

   export default defineNuxtModule({
     meta: { name: "wiki-links", configKey: "wikiLinks" },
     setup(_options, nuxt) {
       // Move the WIKI_LINK_REGEX, EXCALIDRAW_EMBED_REGEX,
       // slugifyExcalidraw(), transformWikiLinks() functions here
       // Register the content:file:beforeParse hook
     },
   });
   ```

2. Remove the wiki-link transformation code from `nuxt.config.ts`.

3. Register the module in `nuxt.config.ts`:

   ```ts
   modules: [
     "./modules/wiki-links",
     // ... other modules
   ];
   ```

4. Update `knip.ts` to include `modules/**/*.ts` as entry points.

**Changes**:

- Create `modules/` directory
- Extract wiki-link transformation into `modules/wiki-links/index.ts`
- Extract wiki-link utility functions into `modules/wiki-links/utils.ts`
- Update `nuxt.config.ts` to register the local module and remove inlined code
- Update `knip.ts` entry points

**Acceptance Criteria**:

- [ ] `modules/` directory exists with at least the wiki-links module
- [ ] `nuxt.config.ts` is cleaner -- no inline regex/function definitions at the top
- [ ] Wiki-link transformation still works identically (verify with existing tests)
- [ ] `pnpm build` succeeds
- [ ] `pnpm dev` works correctly with wiki-links in content

---

### Ticket 7: Config Directory Organization

**Priority**: P2
**Estimated Effort**: S
**Description**: Move environment and feature configuration files into a `config/` directory to match npmx's pattern of separated configuration concerns. Keep Nuxt-specific configs (`nuxt.config.ts`, `content.config.ts`, `app.config.ts`) at the root as Nuxt requires.

**Current root-level configs to move**:

- `site.config.ts` --> `config/site.ts`
- `features.config.ts` --> `config/features.ts`

**Configs that stay at root** (Nuxt convention):

- `nuxt.config.ts`
- `content.config.ts`
- `app.config.ts`
- `eslint.config.js`
- `playwright.config.ts`
- `vite.config.ts` (now includes vitest config and oxlint config via Vite+)

**Changes**:

1. Create `config/` directory.
2. Move `site.config.ts` to `config/site.ts` (drop the `.config` suffix -- the directory makes it clear).
3. Move `features.config.ts` to `config/features.ts`.
4. Update all imports:
   - `nuxt.config.ts`: Change `import { siteConfig } from "./site.config"` to `import { siteConfig } from "./config/site"`
   - Any component/composable importing `site.config` or `features.config` -- update paths.
5. Update `knip.ts` entry points:
   - Remove `site.config.ts!` and `features.config.ts!`
   - Add `config/**/*.ts!`
6. Verify no runtime resolution issues (Nuxt aliases should not be affected since these are build-time imports).

**Acceptance Criteria**:

- [ ] `config/` directory exists with `site.ts` and `features.ts`
- [ ] No `*.config.ts` files at root except Nuxt/tool conventions
- [ ] All imports updated and verified via `pnpm typecheck`
- [ ] `pnpm build` succeeds
- [ ] `pnpm knip` reports no new issues

---

### Ticket 8: Playwright Config Alignment

**Priority**: P2
**Estimated Effort**: S
**Description**: Align the Playwright configuration with npmx patterns: add global setup for deterministic test state, customize snapshot paths, and add structured reporter configuration.

**Current state**: Basic Playwright config with chromium-only project, web server command, no global setup.

**Changes to `playwright.config.ts`**:

1. **Add global setup** for consistent test state:

   ```ts
   // test/e2e/global-setup.ts
   import type { FullConfig } from "@playwright/test";

   export default async function globalSetup(_config: FullConfig) {
     // Any pre-test initialization:
     // - Verify the preview server is healthy
     // - Set up test data state if needed
     console.log("E2E global setup: verifying server...");
   }
   ```

   In `playwright.config.ts`:

   ```ts
   globalSetup: './test/e2e/global-setup.ts',
   ```

2. **Add snapshot path template** for organized snapshot storage:

   ```ts
   snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
   ```

3. **Structured output directories**:

   ```ts
   outputDir: './test-results/e2e',
   ```

4. **Enhance reporter config**:

   ```ts
   reporter: process.env.CI
     ? [['html', { outputFolder: 'playwright-report' }], ['github'], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]]
     : [['html', { open: 'never' }]],
   ```

5. **Update `testDir`** to `./test/e2e` (dependent on Ticket 1).

**Acceptance Criteria**:

- [ ] Global setup file exists and runs before E2E tests
- [ ] Snapshot path template is configured
- [ ] JUNIT reporter configured for CI
- [ ] `pnpm test:e2e` passes with new config
- [ ] Playwright report artifacts upload correctly in CI

---

### Ticket 9: Package.json Script Cleanup

> **Note:** Many scripts are now handled by `vp` commands (e.g., `vp lint`, `vp test`, `vp fmt`). Script aliases in `package.json` may delegate to `vp` under the hood.

**Priority**: P1
**Estimated Effort**: S
**Description**: Align package.json script naming conventions with npmx patterns for consistency and clarity. Rename scripts to follow the `category:subcategory` pattern.

**Current scripts** --> **Target scripts**:

| Current         | Target            | Reason                                                           |
| --------------- | ----------------- | ---------------------------------------------------------------- |
| `test:e2e`      | `test:browser`    | npmx convention -- "browser" describes the execution environment |
| `test:e2e:ui`   | `test:browser:ui` | Follows from above                                               |
| `test:nuxt`     | `test:nuxt`       | Keep -- already matches                                          |
| `test:unit`     | `test:unit`       | Keep -- already matches                                          |
| `test:unit:cov` | `test:unit:cov`   | Keep -- already matches                                          |
| `test`          | `test`            | Keep -- runs all vitest projects                                 |
| `test:mutation` | `test:mutation`   | Keep -- unique to this project                                   |
| `lint`          | `lint`            | Keep                                                             |
| `lint:fix`      | `lint:fix`        | Keep                                                             |
| `lint:ox`       | `lint:ox`         | Keep                                                             |
| `lint:es`       | `lint:es`         | Keep                                                             |
| `lint:md`       | `lint:md`         | Keep                                                             |
| `format`        | `format`          | Keep                                                             |
| `format:check`  | `format:check`    | Keep                                                             |
| `knip`          | `knip`            | Keep                                                             |
| `knip:fix`      | `knip:fix`        | Keep                                                             |
| (new)           | `test:a11y`       | Extract Lighthouse into its own script for local testing         |

**Changes to `package.json`**:

1. Rename `test:e2e` to `test:browser`:

   ```json
   "test:browser": "playwright test",
   "test:browser:ui": "playwright test --ui",
   ```

2. Add `test:a11y` script:

   ```json
   "test:a11y": "lhci autorun --config .lighthouserc.cjs",
   ```

3. Remove `ralph` and `fix-e2e` scripts if they are development-only convenience scripts (or keep if actively used -- verify with project owner).

4. Update CI workflow to reference `test:browser` instead of `test:e2e`.

5. Update `CLAUDE.md` to document the new script names:
   ```bash
   pnpm test:browser  # E2E tests with Playwright - CI only (~30s)
   ```

**Acceptance Criteria**:

- [ ] `pnpm test:browser` runs Playwright E2E tests
- [ ] `pnpm test:a11y` runs Lighthouse accessibility audits
- [ ] CI workflow uses updated script names
- [ ] `CLAUDE.md` reflects new naming
- [ ] No broken script references anywhere in the repo

---

### Ticket 10: Pre-commit Hook Enhancement

> **Note:** `simple-git-hooks` + `lint-staged` have been replaced by the `staged` block in `vite.config.ts` as part of the Vite+ migration. Pre-commit hooks now run via `vp lint` and `vp fmt`.

**Priority**: P2
**Estimated Effort**: S
**Description**: Align git pre-commit hooks with npmx patterns: ensure oxlint covers everything it can, remove ESLint from pre-commit for files that oxlint handles (keeping ESLint only for rules oxlint cannot replicate), and add oxfmt for all staged files.

**Current lint-staged config**:

```json
{
  "lint-staged": {
    "*.{ts,vue}": ["pnpm exec oxfmt", "pnpm exec oxlint --fix"],
    "*.vue": ["pnpm exec eslint --fix"],
    "content/**/*.md": ["pnpm exec markdownlint-cli2 --fix"]
  }
}
```

**Target lint-staged config**:

```json
{
  "lint-staged": {
    "*.{ts,vue,js,mjs}": ["pnpm exec oxfmt", "pnpm exec oxlint --fix"],
    "*.vue": ["pnpm exec eslint --fix"],
    "content/**/*.md": ["pnpm exec markdownlint-cli2 --fix"]
  }
}
```

**Changes**:

1. **Extend oxfmt/oxlint to `.js` and `.mjs` files**: The current config only formats `.ts` and `.vue`. Add `.js` and `.mjs` to catch config files and scripts.

2. **Keep ESLint for `.vue` files**: The custom ESLint rules (`error-handling/no-try-catch`, `nuxt-content/require-async-data`, `vuejs-accessibility/*`, `vue/max-template-depth`, `vue/max-props`, `complexity`, `no-restricted-imports`, `no-restricted-syntax`, `@typescript-eslint/consistent-type-assertions`) cannot be replaced by oxlint. ESLint must remain in pre-commit for `.vue` files.

3. **Consider adding ESLint for `.ts` files**: The `error-handling/no-try-catch`, `nuxt-content/require-async-data`, `complexity`, and `@typescript-eslint/consistent-type-assertions` rules also apply to `.ts` files. Currently ESLint only runs on `.vue` in pre-commit. Add it for `.ts` as well:

   ```json
   "*.ts": [
     "pnpm exec eslint --fix"
   ]
   ```

4. **Add format-only step for other file types** (optional, low priority):
   ```json
   "*.{json,yaml,yml}": [
     "pnpm exec oxfmt"
   ]
   ```
   Only if oxfmt supports these formats. If not, skip this.

**Acceptance Criteria**:

- [ ] Pre-commit hooks run oxfmt + oxlint on `.ts`, `.vue`, `.js`, `.mjs`
- [ ] ESLint runs on `.vue` and `.ts` for custom rules
- [ ] markdownlint runs on content markdown
- [ ] `git commit` with a staged `.ts` file triggers all expected linters
- [ ] Pre-commit completes in under 5 seconds for typical staged changes

---

## Implementation Order

The recommended order accounts for dependencies between tickets:

```text
Phase 1 (Foundation):
  Ticket 1: Test Directory Restructure     [P0, M]  -- must go first, many others depend on paths
  Ticket 9: Package.json Script Cleanup     [P1, S]  -- small, unblocks CI changes

Phase 2 (Core Improvements):
  Ticket 2: Vitest Config Alignment         [P1, M]  -- depends on Ticket 1
  Ticket 3: oxlint Config Enhancement       [P1, M]  -- independent, can parallel with Ticket 2
  Ticket 4: CI/CD Pipeline Modernization    [P1, L]  -- depends on Tickets 1, 2, 9

Phase 3 (Polish):
  Ticket 7: Config Directory Organization   [P2, S]  -- independent
  Ticket 10: Pre-commit Hook Enhancement    [P2, S]  -- independent
  Ticket 8: Playwright Config Alignment     [P2, S]  -- depends on Ticket 1
  Ticket 5: Lighthouse CI Improvement       [P2, M]  -- depends on Ticket 4
  Ticket 6: Extract Reusable Nuxt Modules   [P2, L]  -- independent, but do last (most invasive)
```

**Total estimated effort**: ~5-7 working days

## What We Are NOT Changing

For clarity, these are explicitly out of scope:

1. **Styling** -- Tailwind CSS stays, no UnoCSS migration
2. **UI framework** -- @nuxt/ui v4 stays
3. **Validation library** -- Zod stays, no Valibot migration
4. **Auto-imports** -- Remain disabled (deliberate project choice)
5. **Error handling** -- `tryCatch` pattern stays
6. **Mutation testing** -- Stryker stays (npmx does not have it, but it adds value)
7. **Custom ESLint plugins** -- `frontmatter`, `error-handling`, `nuxt-content` stay
8. **Content structure** -- Flat Zettelkasten with wiki-links stays
9. **Deployment target** -- Vercel deployment stays
