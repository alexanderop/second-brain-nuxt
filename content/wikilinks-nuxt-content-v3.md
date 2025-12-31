---
title: "Building Wiki-Style Links for Nuxt Content v3"
description: "How I built a custom wikilinks module for my second brain project when the official remark plugin didn't work"
date: 2024-12-31
tags: ["nuxt", "nuxt-content", "vue", "tutorial"]
---

# Building Wiki-Style Links for Nuxt Content v3

I wanted to build my own second brain. You know, one of those interconnected note-taking systems where ideas link to other ideas. Think Obsidian or Roam Research, but as a website I control.

Nuxt Content seemed perfect. Markdown files, Vue components, SQLite-powered queries. I spun up a project and started writing notes.

Then I tried to link them together.

## The Problem

In tools like Obsidian, you link notes with double brackets:

```markdown
The compound effect is a fundamental principle that underlies [[atomic-habits]].
```

I typed this into my markdown file. Nuxt Content rendered it as plain text. No link. Just brackets staring back at me.

## The "Official" Solution Doesn't Work

A remark plugin called `remark-wiki-link` exists. Remark powers Nuxt Content's markdown parsing, so this should work, right?

I tried adding it to my `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-wiki-link': {}
        }
      }
    }
  }
})
```

The plugin needs a `hrefTemplate` function to generate URLs. Here's the catch: **Nuxt can't serialize functions in its config**. The function just disappears. Your links point nowhere.

This is a [known issue](https://github.com/nuxt/content/issues/2532). People have been asking about wikilinks support [since 2020](https://github.com/nuxt/content/issues/740).

## Building My Own Module

I used Claude Code to build a custom Nuxt module. The approach: intercept markdown files _before_ they reach the parser, and transform `[[slug]]` into regular markdown links.

Here's the full module at `modules/wikilinks.ts`:

```typescript
import type { Nuxt } from '@nuxt/schema'
import { defineNuxtModule } from '@nuxt/kit'

const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export default defineNuxtModule({
  meta: {
    name: 'wikilinks',
    configKey: 'wikilinks',
  },
  setup(_options, nuxt: Nuxt) {
    nuxt.hooks.hook('content:file:beforeParse', (ctx) => {
      if (typeof ctx.file?.body === 'string') {
        ctx.file.body = ctx.file.body.replace(
          wikiLinkRegex,
          (_, slug, displayText) => {
            const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-')
            const text = displayText?.trim() || slug.trim()
            return `[${text}](/${normalizedSlug}){.wiki-link}`
          }
        )
      }
    })
  },
})
```

35 lines. Let me break down how it works.

## How Nuxt Modules Work

If you're new to Nuxt, modules extend the framework's functionality. You define them with `defineNuxtModule()` from `@nuxt/kit`.

Every module has a `setup` function. Nuxt calls this function when your app starts. Inside `setup`, you access the `nuxt` object and hook into the build process.

```typescript
export default defineNuxtModule({
  meta: {
    name: 'wikilinks', // module name
    configKey: 'wikilinks', // config key in nuxt.config.ts
  },
  setup(_options, nuxt) {
    // your code runs here during build
  },
})
```

## The Hook: content:file:beforeParse

Nuxt Content fires hooks at different stages of content processing. The `content:file:beforeParse` hook runs after Nuxt reads a markdown file but before it parses the markdown into HTML.

This gives us raw markdown text. We can modify it however we want.

```typescript
nuxt.hooks.hook('content:file:beforeParse', (ctx) => {
  // ctx.file.body contains the raw markdown string
})
```

## The Regex

The regex matches two patterns:

- `[[slug]]` - basic wiki link
- `[[slug|Display Text]]` - wiki link with custom text

```typescript
const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
```

Breaking it down:

- `\[\[` - matches opening `[[`
- `([^\]|]+)` - captures the slug (anything except `]` or `|`)
- `(?:\|([^\]]+))?` - optionally captures display text after `|`
- `\]\]` - matches closing `]]`

## The Transformation

For each match, we generate a standard markdown link:

```typescript
ctx.file.body = ctx.file.body.replace(
  wikiLinkRegex,
  (_, slug, displayText) => {
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-')
    const text = displayText?.trim() || slug.trim()
    return `[${text}](/${normalizedSlug}){.wiki-link}`
  }
)
```

Input: `[[Atomic Habits]]`
Output: `[Atomic Habits](/atomic-habits){.wiki-link}`

The `{.wiki-link}` part uses MDC (Markdown Components) syntax. Nuxt Content adds this as a CSS class to the rendered anchor tag. Style your wiki links however you want.

## Register the Module

Add your module to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    './modules/wikilinks', // your custom module
  ],
})
```

Nuxt loads modules in order. Our wikilinks module registers its hook, and every markdown file gets transformed before parsing.

## Style Your Links

Add some CSS to distinguish wiki links:

```css
.wiki-link {
  text-decoration-style: dotted;
}

.wiki-link:hover {
  text-decoration-style: solid;
}
```

## It Works

Now when I write:

```markdown
The compound effect underlies [[atomic-habits]] and connects to
[[building-a-second-brain|the BASB methodology]].
```

Nuxt Content renders proper links. My notes connect. The second brain lives.

## Why This Approach Wins

Building a custom module beats fighting with `remark-wiki-link` because:

1. **No serialization issues** - We transform text, not config functions
2. **Full control** - Change the URL structure, add classes, whatever you need
3. **Simple** - 35 lines versus wrestling with plugin workarounds
4. **Debuggable** - Add `console.log` and see exactly what's happening

Sometimes the best solution is the one you build yourself.

---

The code lives in my [second brain project](https://github.com/your-username/secondBrain). Steal it for your own.
