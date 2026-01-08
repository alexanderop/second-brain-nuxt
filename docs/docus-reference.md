# Docus Reference Guide

Comprehensive reference for implementing a documentation site with Docus v3.

> **Important:** Docus v3 requires a [Nuxt UI Pro license](https://ui.nuxt.com/pro). For OSS projects, request a free license at ui-pro@nuxt.com.

## 1. Installation & Setup

### Quick Start with CLI

```bash
npx create-docus my-docs
cd my-docs
npm run dev
```

### Multi-language Template

```bash
npx create-docus my-docs -t i18n
```

### Layer Integration (Existing Nuxt Project)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['docus']
})
```

### Technology Stack

- **Nuxt 4** (Nuxt 3 with v4 compatibility mode)
- **@nuxt/content v3** - File-based content management
- **@nuxt/ui v4** - UI components (requires Pro license)
- **Tailwind CSS 4** - Styling
- **Nuxt i18n** - Multi-language support
- **Fuse.js** - Full-text search
- **nuxt-llms** - LLM/AI integration

### Minimal File Structure

```
my-docs/
├── content/           # Markdown files
│   └── index.md
├── public/            # Static assets
└── package.json
```

---

## 2. Configuration Options

### app.config.ts

```typescript
export default defineAppConfig({
  // SEO defaults
  seo: {
    title: 'My Documentation',
    description: 'Documentation description',
    ogImage: '/og-image.png',
    titleTemplate: '%s | My Docs'
  },

  // Header configuration
  header: {
    title: 'Docs Site Name',
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
      alt: 'Logo'
    }
  },

  // Social links (uses Simple Icons names)
  socials: {
    x: 'https://x.com/username',
    github: 'https://github.com/username',
    discord: 'https://discord.gg/...'
  },

  // Table of contents
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/...',
      links: []
    }
  },

  // Docus-specific
  docus: {
    locale: 'en'
  },

  // GitHub integration (or false to disable)
  github: 'username/repo',

  // UI theming
  ui: {
    colors: {
      primary: 'green',
      secondary: 'sky'
    }
  }
})
```

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  // Site metadata
  site: {
    name: 'My Documentation'
  },

  // Code highlighting
  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      },
      // Add languages beyond defaults
      langs: ['python', 'rust', 'go']
    }
  }
})
```

### Environment Variables

- `NUXT_SITE_URL` - Override inferred site URL for OG images

---

## 3. Content Structure

### Single Language

```
content/
├── index.md                    # Landing page
├── 1.getting-started/
│   ├── 1.introduction.md
│   └── 2.installation.md
├── 2.guide/
│   ├── 1.basics.md
│   └── 2.advanced.md
└── 3.api/
    └── 1.reference.md
```

### Multi-Language (i18n)

```
content/
├── en/
│   ├── index.md
│   └── 1.getting-started/
│       └── 1.introduction.md
└── fr/
    ├── index.md
    └── 1.getting-started/
        └── 1.introduction.md
```

### Navigation Ordering

Use numbered prefixes for ordering:
- `1.getting-started/` renders before `2.guide/`
- `1.introduction.md` renders before `2.installation.md`
- Numbers are stripped from URLs

### Frontmatter Options

```yaml
---
title: Page Title
description: Meta description for SEO
navigation: true          # Show in sidebar (default: true)
layout: docs              # 'default' or 'docs'
seo:
  title: Custom SEO Title
  description: Custom meta description
  ogImage: /custom-og.png
---
```

---

## 4. Built-in Components

### Callouts

```mdc
::note
Informational note content.
::

::tip
Helpful suggestion content.
::

::warning
Warning content.
::

::caution
Critical warning content.
::
```

### Code Groups (Tabs)

```mdc
::code-group
```bash [npm]
npm install docus
```

```bash [pnpm]
pnpm add docus
```

```bash [yarn]
yarn add docus
```
::
```

### Steps

```mdc
::steps
### Step 1
First step content.

### Step 2
Second step content.
::
```

### Cards

```mdc
::card-group
::card{title="Card Title" icon="i-heroicons-rocket-launch"}
Card content here.
::

::card{title="Another Card" icon="i-heroicons-code-bracket"}
More content.
::
::card-group
```

### Additional Components

| Component | Purpose |
|-----------|---------|
| `Accordion` | Collapsible sections |
| `Badge` | Inline status indicators |
| `Fields` | Parameter/prop documentation |
| `Icons` | SVG icon integration |
| `Kbd` | Keyboard key display |
| `CodeTree` | File structure visualization |
| `CodePreview` | Code with live preview |
| `CodeCollapse` | Expandable code blocks |

### Code Block Features

- **Copy button**: Built-in
- **Filename**: `\`\`\`ts [filename.ts]`
- **Line highlighting**: `\`\`\`ts {2-4,6}`
- **Syntax highlighting**: 10+ default languages

Default languages: JSON, JS, TS, HTML, CSS, Vue, Shell, MDC, Markdown, YAML

---

## 5. Features

### Search

- Full-text search via Fuse.js
- Built-in search modal (Cmd/Ctrl + K)
- No configuration required

### Dark Mode

- Built-in, no configuration needed
- Auto-detects system preference
- Manual toggle available

### SEO

- Automatic meta tags from frontmatter
- OG image generation
- Sitemap generation
- robots.txt support

### AI Integration

- Automatic `llms.txt` generation
- Model Context Protocol (MCP) server
- Works with Cursor, VS Code, Claude

### Nuxt Studio

- Browser-based visual editing
- Non-technical collaboration
- Component embedding without code

---

## 6. Deployment

### Build for Production

```bash
npm run build
# Output: .output/public/
```

### Static Generation

```bash
nuxt generate
# or
nuxt build --prerender
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Auto-detected as Nuxt project
4. Deploy

Or use one-click deploy button from Docus repo.

### Static Hosting

Deploy `.output/public/` to:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Any static host

### Local Preview

```bash
npx serve .output/public
```

### Pre-render Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
      crawlLinks: true
    }
  }
})
```

### Gotcha: No Server Endpoints

When using `nuxt generate`, server endpoints are NOT included. Plan accordingly for dynamic features.

---

## 7. Customization

### Override Components

Create components in `app/components/` to override defaults:

| Component | Purpose |
|-----------|---------|
| `AppHeaderLogo` | Header logo |
| `AppHeaderCTA` | Call-to-action buttons |
| `AppHeaderCenter` | Search bar area |
| `AppFooterLeft` | Footer left section |
| `AppFooterRight` | Footer right section |
| `DocsPageHeaderLinks` | Page actions |
| `DocsAsideLeftTop` | Left sidebar top |
| `DocsAsideRightBottom` | Right sidebar bottom |

### Custom CSS Variables

```css
/* app/assets/main.css */
@theme static {
  --font-sans: 'Public Sans', sans-serif;
  --color-green-50: #EFFDF5;
}
```

### Custom Components in Markdown

Create Vue components in `app/components/content/` and use in Markdown:

```mdc
::MyCustomComponent{prop="value"}
Slot content here.
::
```

---

## 8. Best Practices

### Content Organization

- Use numbered prefixes for ordering
- Keep folder structure flat when possible
- Use `index.md` for section landing pages
- Lowercase, hyphenated file names

### SEO

- Define defaults in `app.config.ts`
- Override per-page in frontmatter
- Set `NUXT_SITE_URL` for OG images
- Include descriptive titles/descriptions

### Performance

- Optimize images before adding to `/public`
- Use `CodeCollapse` for long code blocks
- Use tabs for code variants (don't duplicate)
- Leverage lazy-loaded components

### i18n

- Mirror directory structure across languages
- Set `defaultLocale` in config
- Users redirect to default if language unavailable

---

## Sources

- [Docus Official Site](https://docus.dev)
- [GitHub - nuxt-content/docus](https://github.com/nuxt-content/docus)
- [Docus v3 Announcement](https://content.nuxt.com/blog/docus-v3)
- [Docus Template](https://content.nuxt.com/templates/docus)
- [Nuxt Deployment Guide](https://nuxt.com/docs/4.x/getting-started/deployment)
