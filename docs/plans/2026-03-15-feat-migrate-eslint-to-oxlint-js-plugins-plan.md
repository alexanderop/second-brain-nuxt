---
title: Migrate ESLint rules to oxlint native rules and JS plugins
type: feat
status: done
date: 2026-03-15
---

# Migrate ESLint Rules to Oxlint Native Rules and JS Plugins

## Overview

Consolidate linting by moving everything oxlint can handle out of ESLint. This has two parts:

1. **Built-in rules** (`no-restricted-imports`, `complexity`, `max-lines`, `vue/max-props`) move to oxlint native rules in `vite.config.ts`
2. **Custom plugins** (`error-handling`, `nuxt-content`) move to oxlint JS plugins via `jsPlugins`
3. **Frontmatter plugin** stays in ESLint (operates on mdast, not ESTree)

After migration, ESLint handles only: markdown/frontmatter validation, Vue accessibility, `no-restricted-syntax`, `vue/max-template-depth`, and custom plugin rules on `.vue` files (until oxlint JS plugins support Vue SFCs).

## Problem Statement / Motivation

The project runs two JS/TS linters in sequence (`vp lint && eslint .`). ESLint is ~50-100x slower than oxlint. Every rule moved to oxlint reduces ESLint's workload and speeds up the lint pipeline. Oxlint v1.55.0 now supports `no-restricted-imports`, `complexity`, `max-lines`, and `vue/max-props` natively, and JS plugins (alpha) can run custom ESLint rules on `.ts` files.

## Proposed Solution

### Phase 0: Verify (5 min)

Confirm oxlint JS plugins work with the project's custom plugins before committing to migration.

Create a minimal test:

```bash
# Add jsPlugins to vite.config.ts with just error-handling
# Run vp lint on a file that has a try-catch
# Verify it reports the violation
```

If `vp lint` does NOT load the JS plugin or reports errors, stop — jsPlugins may not work with Vite+'s config passthrough. Fall back to Phase 1 only (built-in rules).

### Phase 1: Move built-in rules to oxlint

Add these rules to `vite.config.ts` `lint.rules` and remove them from `eslint.config.js`:

#### `vite.config.ts` additions

```typescript
// In lint.rules:
'no-restricted-imports': ['error', {
  paths: [{
    name: 'vue',
    importNames: ['reactive'],
    message: 'Use ref() instead of reactive() for consistent reactivity patterns.',
  }],
}],
'complexity': ['error', { max: 10 }],
'max-lines': ['warn', { max: 600 }],
'vue/max-props': ['error', { maxProps: 6 }],
```

#### `vite.config.ts` overrides addition

```typescript
// In lint.overrides, add to existing or new entry:
{
  files: ['**/stores/**'],
  rules: {
    'no-restricted-imports': 'off',
  },
},
```

> **Note:** The `**/stores/**` directory does not currently exist. Carry the override forward for future use — it's harmless.

#### `eslint.config.js` removals

Remove from the `**/*.ts` block:

- `complexity: ["error", 10]`
- `no-restricted-imports` (entire rule config)

Remove from the `**/*.vue` block:

- `complexity: ["error", 10]`
- `no-restricted-imports` (entire rule config)
- `max-lines: ["warn", { max: 600, skipBlankLines: true, skipComments: true }]`
- `vue/max-props: ["error", { maxProps: 6 }]`

Remove the `**/stores/**` override block entirely.

> **Caveat:** oxlint's `max-lines` may not support `skipBlankLines`/`skipComments` options. Verify with `vp lint` after adding. If unsupported, keep `max-lines` in ESLint.

### Phase 2: Add JS plugins for custom rules (.ts files)

#### `vite.config.ts` changes

```typescript
lint: {
  // ... existing config ...
  jsPlugins: [
    './eslint-plugin-error-handling/index.ts',
    './eslint-plugin-nuxt-content/index.ts',
  ],
  rules: {
    // ... existing rules ...
    'error-handling/no-try-catch': 'error',
    'nuxt-content/require-async-data': 'error',
  },
  overrides: [
    // ... existing overrides ...
    {
      files: ['**/shared/utils/tryCatch.ts'],
      rules: {
        'error-handling/no-try-catch': 'off',
      },
    },
    {
      files: ['eslint-plugin-*/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'error-handling/no-try-catch': 'off', // plugin code may use try-catch
      },
    },
  ],
},
```

#### Handle `eslint-disable-next-line` comments

`app/composables/usePrefetchContent.ts` has:

```typescript
// eslint-disable-next-line nuxt-content/require-async-data
```

This must be converted to:

```typescript
// oxlint-disable-next-line nuxt-content/require-async-data
```

Search for ALL `eslint-disable` comments referencing migrated rules:

```bash
grep -rn 'eslint-disable.*no-try-catch\|eslint-disable.*require-async-data' app/ server/ shared/
```

#### What stays in ESLint for `.vue` files

**Critical:** JS plugins cannot parse Vue SFCs. Both `error-handling/no-try-catch` and `nuxt-content/require-async-data` must REMAIN in `eslint.config.js` for `**/*.vue` files. The ESLint config keeps the plugin registrations and rules for Vue — only `.ts` enforcement moves to oxlint.

The `eslint.config.js` `**/*.vue` block retains:

- `error-handling/no-try-catch: "error"`
- `nuxt-content/require-async-data: "error"`
- All `vuejs-accessibility/*` rules
- `vue/max-template-depth`
- `no-restricted-syntax` (ban else, ban barrel exports)

The `eslint.config.js` `**/*.ts` block changes:

- Remove `error-handling/no-try-catch` (now in oxlint)
- Remove `nuxt-content/require-async-data` (now in oxlint)
- Keep `no-restricted-syntax` (not in oxlint)

### Phase 3: Slim down ESLint config and deps

#### Remove unused ESLint config

Delete `eslint.config.mjs` — it's the Nuxt-generated wrapper (`withNuxt()`) that's unused since `eslint.config.js` takes precedence.

#### Remove `@nuxt/eslint` dependency

```bash
vp rm @nuxt/eslint
```

This package generates the unused `eslint.config.mjs`. The project's real config is `eslint.config.js`.

#### Update lint scripts

```jsonc
// package.json scripts
"lint": "vp lint && eslint . && markdownlint-cli2 'content/**/*.md'",
// ^ no change needed, but eslint runs faster now (fewer rules)
```

#### Update staged config

```typescript
// vite.config.ts staged block
staged: {
  '*.{ts,vue,js,mjs}': 'vp check --fix',
  '*.vue': 'eslint --fix',                    // Keep: Vue a11y, custom plugins on .vue
  'content/**/*.md': 'eslint --fix',           // Add: frontmatter validation on staged MD
  'content/**/*.md': 'markdownlint-cli2 --fix',
},
```

Remove `'*.ts': 'eslint --fix'` — the only ESLint rules for `.ts` files after migration are `no-restricted-syntax` (ban else/barrel exports). These are style rules that don't need staged enforcement; `vp check` handles the critical path.

> **Wait:** Can staged config have duplicate keys? If not, combine MD:
>
> ```typescript
> 'content/**/*.md': 'eslint --fix && markdownlint-cli2 --fix',
> ```

### Phase 4: Cleanup

- [ ] Delete `.oxlintrc.json.bak` (already migrated to `vite.config.ts`)
- [ ] Delete `eslint.config.mjs` (unused Nuxt-generated config)
- [ ] Remove `@nuxt/eslint` from `package.json` dependencies
- [ ] Run `vp install` to clean lockfile
- [ ] Verify `vp lint` passes (oxlint native rules + JS plugins)
- [ ] Verify `eslint .` passes (remaining rules)
- [ ] Run `vp check && pnpm typecheck` for full validation

## Technical Considerations

### JS Plugin Alpha Risks

- **No semver guarantees** — oxlint may break JS plugin API in minor releases
- **Vue SFC not supported** — custom rules cannot visit nodes in `.vue` `<script>` blocks via JS plugins. This means ESLint must remain for `.vue` coverage of `no-try-catch` and `require-async-data`
- **Mitigation:** The plugins are simple (1 rule each, basic AST visitors). If JS plugins break, re-add the rules to ESLint for `.ts` files too — it's a 2-line config change

### API Compatibility (Verified)

| API                                     | Used by        | Supported in oxlint JS plugins? |
| --------------------------------------- | -------------- | ------------------------------- |
| `TryStatement` visitor                  | error-handling | Yes                             |
| `CallExpression` visitor                | nuxt-content   | Yes                             |
| `context.report({ node, messageId })`   | Both           | Yes                             |
| `context.filename`                      | nuxt-content   | Yes                             |
| `context.sourceCode.getAncestors(node)` | nuxt-content   | Yes                             |
| `node.range`                            | nuxt-content   | Yes                             |

### Oxlint Rule Options Verification Needed

| Rule                    | ESLint options                                           | oxlint equivalent?                  |
| ----------------------- | -------------------------------------------------------- | ----------------------------------- |
| `no-restricted-imports` | `paths` with `importNames`                               | Yes — full support confirmed        |
| `complexity`            | `["error", 10]` shorthand                                | Use `["error", { max: 10 }]`        |
| `max-lines`             | `{ max: 600, skipBlankLines: true, skipComments: true }` | **Verify** — may only support `max` |
| `vue/max-props`         | `{ maxProps: 6 }`                                        | **Verify** — option name may differ |

### require-async-data Value Assessment

`queryCollection()` appears in:

- **3 `.ts` composable files** — covered by oxlint JS plugin after migration
- **18 `.vue` files (34 call sites)** — still covered by ESLint

The bulk of enforcement value is in `.vue` files. The `.ts` migration is small but establishes the pattern for when Vue SFC support lands.

## Acceptance Criteria

### Functional Requirements

- [ ] `vp lint` enforces `no-restricted-imports` (ban `reactive()` except in stores)
- [ ] `vp lint` enforces `complexity` with max 10
- [ ] `vp lint` enforces `max-lines` with max 600
- [ ] `vp lint` enforces `vue/max-props` with max 6
- [ ] `vp lint` loads JS plugins and enforces `no-try-catch` on `.ts` files
- [ ] `vp lint` loads JS plugins and enforces `require-async-data` on `.ts` composables
- [ ] `vp lint` exempts `tryCatch.ts` from `no-try-catch`
- [ ] `eslint .` still enforces `no-try-catch` and `require-async-data` on `.vue` files
- [ ] `eslint .` still enforces all `vuejs-accessibility` rules on `.vue` files
- [ ] `eslint .` still enforces frontmatter rules on `content/**/*.md`
- [ ] `eslint .` still enforces `no-restricted-syntax` on `.ts` and `.vue` files
- [ ] No duplicate rule enforcement (same rule running in both oxlint and ESLint on same files)

### Quality Gates

- [ ] `vp check && pnpm typecheck` passes
- [ ] `vp lint` passes
- [ ] `eslint .` passes
- [ ] `vp test --project unit` passes
- [ ] No new lint warnings introduced

## Dependencies & Risks

| Risk                                                   | Likelihood | Impact | Mitigation                                                    |
| ------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------- |
| JS plugins break in future oxlint update               | Medium     | Medium | Re-add rules to ESLint `.ts` block (2-line change)            |
| `max-lines` options incompatible                       | Low        | Low    | Keep `max-lines` in ESLint if options differ                  |
| `vp lint` doesn't pass `jsPlugins` to oxlint           | Low        | High   | Phase 0 verification catches this before any changes          |
| Duplicate enforcement (oxlint + ESLint fire same rule) | Medium     | Low    | Test with intentional violation, verify only one tool reports |

## Post-migration ESLint Config (Target State)

After all phases, `eslint.config.js` should contain ONLY:

**For `**/\*.ts` files:\*\*

- `no-restricted-syntax` (ban else, ban barrel exports in auto-import dirs)

**For `**/\*.vue` files:\*\*

- `error-handling/no-try-catch`
- `nuxt-content/require-async-data`
- `vuejs-accessibility/*` (19 rules)
- `vue/max-template-depth`
- `no-restricted-syntax` (ban else)

**For `content/**/\*.md` files:\*\*

- `@eslint/markdown` rules
- `frontmatter/*` (10 rules)

**Overrides:**

- `tryCatch.ts` — exempt from `no-try-catch`
- `search.vue` — exempt from `no-autofocus`
- `eslint-plugin-*/**` — exempt from `no-explicit-any`

## References & Research

### Verified Rule Availability (oxlint v1.55.0)

```
| no-restricted-imports | eslint |
| complexity            | eslint |
| max-lines             | eslint |
| vue/max-props         | vue    |
```

### Key Documentation

- [Oxlint JS Plugins Alpha (2026-03-11)](https://oxc.rs/blog/2026-03-11-oxlint-js-plugins-alpha)
- [Oxlint JS Plugins Docs](https://oxc.rs/docs/guide/usage/linter/js-plugins)
- [Oxlint Rules Reference](https://oxc.rs/docs/guide/usage/linter/rules)
- [Vite+ Lint Guide](https://viteplus.dev/guide/lint)
- [Oxlint Config Reference](https://oxc.rs/docs/guide/usage/linter/config)

### Internal References

- Current ESLint config: `eslint.config.js`
- Current oxlint config: `vite.config.ts` (lint block, lines 11-101)
- Custom plugin: `eslint-plugin-error-handling/` (1 rule)
- Custom plugin: `eslint-plugin-nuxt-content/` (1 rule)
- Custom plugin: `eslint-plugin-frontmatter/` (10 rules, stays in ESLint)
- Disable comment to migrate: `app/composables/usePrefetchContent.ts:30`
- Override target: `shared/utils/tryCatch.ts`
