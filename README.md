# Second Brain

A personal knowledge base for capturing and connecting content using Zettelkasten-style wiki-links.

## Documentation

Full documentation is available at **[docs.secondbrain.dev](https://docs.secondbrain.dev)** covering:

- [Getting Started](https://docs.secondbrain.dev/getting-started/introduction) - Setup and project structure
- [Content Types](https://docs.secondbrain.dev/content/content-types) - All 16 content types with examples
- [Features Guide](https://docs.secondbrain.dev/features/overview) - Knowledge graph, search, table view
- [Claude Code Skills](https://docs.secondbrain.dev/claude-code/overview) - AI-assisted workflows
- [Customization](https://docs.secondbrain.dev/customization/site-config) - Theming and extending
- [Deployment](https://docs.secondbrain.dev/deployment/vercel) - Vercel, Netlify, Cloudflare

## Monorepo Structure

This project uses pnpm workspaces:

```
second-brain-nuxt/
├── apps/
│   ├── web/          # Main Nuxt application
│   └── docs/         # Documentation site (Docus)
├── pnpm-workspace.yaml
└── package.json      # Root workspace scripts
```

## Quick Start

### Prerequisites

- Node.js 24.x (required for native SQLite support)
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/second-brain-nuxt.git
cd second-brain-nuxt

# Install dependencies
pnpm install
```

### Development

```bash
# Start the main web app (port 3000)
pnpm dev

# Start the docs site (port 3001)
pnpm dev:docs

# Run both in parallel
pnpm dev & pnpm dev:docs
```

### Build

```bash
# Build the web app
pnpm build

# Build the docs site
pnpm build:docs
```

### Quality Checks

```bash
# Lint and fix issues
pnpm lint:fix

# Type checking
pnpm typecheck

# Run unit tests
pnpm test:unit
```

## Workspace Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start web app at localhost:3000 |
| `pnpm build` | Build web app for production |
| `pnpm dev:docs` | Start docs site at localhost:3001 |
| `pnpm build:docs` | Build docs site for production |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm typecheck` | Verify type safety |
| `pnpm test:unit` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests (CI only) |

## Features

- **Content Library**: Store articles, podcasts, books, videos, and notes
- **Wiki-Links**: Connect ideas with `[[slug]]` syntax
- **Knowledge Graph**: Visualize connections between notes
- **Full-Text Search**: Find anything with Cmd+K
- **Backlinks & Mentions**: See what links to each note

## AI-Assisted Workflow

This project includes 19+ skills for AI coding assistants (Claude Code, Cursor, Windsurf) to help manage your knowledge base. Skills are stored in `.claude/skills/`.

### Key Skills

| Skill | What it does |
|-------|--------------|
| `/adding-notes` | Create notes from URLs with proper frontmatter |
| `/linking-notes` | Discover wiki-link opportunities |
| `/reviewing-notes` | Audit quality (broken links, orphans) |
| `/enhancing-notes` | Add Blinkist-style summaries |
| `/moc-curator` | Suggest MOC updates via semantic clustering |
| `/exploring-graph` | Graph analytics and insights |

See the [Claude Code documentation](https://docs.secondbrain.dev/claude-code/overview) for the complete list.

## Content Types

| External | Personal |
|----------|----------|
| youtube, podcast, article, book | quote, note |
| manga, movie, tv, tweet | evergreen, map |
| course, reddit, github, newsletter | |

## Tech Stack

- [Nuxt 4](https://nuxt.com) - Vue framework
- [@nuxt/content v3](https://content.nuxt.com) - Markdown content with SQLite
- [@nuxt/ui v4](https://ui.nuxt.com) - UI components
- [D3.js](https://d3js.org) - Knowledge graph visualization
- [Docus](https://docus.dev) - Documentation site

## License

MIT
