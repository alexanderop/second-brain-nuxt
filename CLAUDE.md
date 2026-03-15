# CLAUDE.md

Second Brain is a personal knowledge base for capturing and connecting content (podcasts, articles, books, etc.) using Zettelkasten-style wiki-links.

## Owner

This Second Brain belongs to **Alexander Opalic**. When creating personal notes, TILs, or blog posts, use `authors: [alexander-opalic]` in frontmatter.

## General Rules

- Always use `pnpm` as the package manager, never `npm` or `yarn`.

## Commands

```bash
pnpm dev                  # Start dev server at localhost:3000
pnpm build                # Build for production
vp check                  # Format + lint + type-check in one pass
pnpm lint:fix             # Auto-fix linting issues
pnpm typecheck            # Verify type safety
pnpm generate:embeddings  # Regenerate semantic search embeddings
```

Run `vp check && pnpm typecheck` after code changes.

## Testing

```bash
vp test --project unit    # Fast tests for local dev (~500ms)
pnpm test:browser         # Browser tests - CI only (~30s)
```

Always use `vp test --project unit` for local development.

## Stack

- **Nuxt 4** - Vue framework
- **@nuxt/content v3** - Markdown content with SQLite queries
- **@nuxt/ui v4** - UI components
- **Vite+** - Unified toolchain (vite, vitest, oxlint, oxfmt)

## Structure

- `app/` - Vue application (pages, components, composables)
- `content/` - Markdown files (flat structure, type via frontmatter)
- `config/` - Site and feature configuration (`site.ts`, `features.ts`)
- `modules/` - Local Nuxt modules (`wiki-links/`)
- `content.config.ts` - Collection schema definitions

## Configuration

All customizable values are in `config/site.ts`. Key composables:

- `useSiteConfig()` - Access site config in components
- `usePageTitle('Page')` - Sets title as "Page - Site Name"

## Key Patterns

- Content uses flat structure with wiki-links: `[[slug]]`
- Query content via `queryCollection('content')`
- Catch-all route at `app/pages/[...slug].vue`

## Further Reading

- `docs/nuxt-content-gotchas.md` - Nuxt Content v3 pitfalls and non-obvious behaviors
- `docs/SYSTEM_KNOWLEDGE_MAP.md` - Architecture, business rules, content conventions
- `docs/testing-strategy.md` - Test layers, when to use each, writing new tests
- `docs/nuxt-ui.md` - Nuxt UI conventions, component usage, theming patterns

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
