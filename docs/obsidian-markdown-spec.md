# Obsidian Flavored Markdown - Implementation Spec

## Current State

Your Second Brain supports ~60% of Obsidian features. This spec covers all missing features organized by implementation priority.

> **Note:** Update `docs/obsidian-features-roadmap.md` - P1 (Heading Links) is already implemented.

---

## Priority Overview

| Priority | Feature | Impact | Effort | Complexity |
|----------|---------|--------|--------|------------|
| **P1** | Callouts | High | Medium | Prose component |
| **P2** | Footnotes | Medium | Low | Remark plugin |
| **P3** | Highlight `==text==` | Medium | Low | Remark plugin |
| **P4** | Comments `%% %%` | Low | Low | Transform regex |
| **P5** | Math/LaTeX | Medium | Medium | KaTeX + rehype |
| **P6** | Note embeds `![[note]]` | High | High | Content fetching |
| **P7** | Block references | Medium | High | Complex parsing |
| **P8** | Aliases | Medium | Medium | Index + resolution |
| **P9** | Image sizing | Low | Low | Transform regex |

---

## P1: Callouts/Admonitions

### Obsidian Syntax
```markdown
> [!note]
> This is a note callout.

> [!warning] Custom Title
> Warning content here.

> [!tip]- Collapsed by default
> Hidden until expanded.

> [!faq]+ Expanded by default
> Can be collapsed.
```

### Supported Types
| Type | Aliases | Color | Icon |
|------|---------|-------|------|
| `note` | - | Blue | `i-heroicons-information-circle` |
| `abstract` | `summary`, `tldr` | Teal | `i-heroicons-clipboard-document-list` |
| `info` | - | Blue | `i-heroicons-information-circle` |
| `todo` | - | Blue | `i-heroicons-check-circle` |
| `tip` | `hint`, `important` | Cyan | `i-heroicons-light-bulb` |
| `success` | `check`, `done` | Green | `i-heroicons-check` |
| `question` | `help`, `faq` | Yellow | `i-heroicons-question-mark-circle` |
| `warning` | `caution`, `attention` | Orange | `i-heroicons-exclamation-triangle` |
| `failure` | `fail`, `missing` | Red | `i-heroicons-x-mark` |
| `danger` | `error` | Red | `i-heroicons-bolt` |
| `bug` | - | Red | `i-heroicons-bug-ant` |
| `example` | - | Purple | `i-heroicons-list-bullet` |
| `quote` | `cite` | Gray | `i-heroicons-chat-bubble-left` |

### Files to Create

**`app/components/content/ProseBlockquote.vue`**
```vue
<script setup lang="ts">
const props = defineProps<{
  // Default props from ContentRenderer
}>()

// Regex to detect callout pattern: [!type] or [!type]- or [!type]+
const calloutRegex = /^\[!(\w+)\]([-+])?\s*(.*)$/i

// Parse first child for callout syntax
const slots = useSlots()
const { type, foldable, collapsed, title, content } = parseCallout(slots)

const calloutConfig = computed(() => CALLOUT_TYPES[type.value] || CALLOUT_TYPES.note)
</script>

<template>
  <div v-if="type" :class="['callout', `callout-${type}`]">
    <div class="callout-header" @click="foldable && toggle()">
      <UIcon :name="calloutConfig.icon" class="callout-icon" />
      <span class="callout-title">{{ title || calloutConfig.label }}</span>
      <UIcon v-if="foldable" :name="collapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-down'" />
    </div>
    <div v-show="!collapsed" class="callout-content">
      <slot />
    </div>
  </div>
  <blockquote v-else class="prose-blockquote">
    <slot />
  </blockquote>
</template>
```

**`app/assets/css/callouts.css`**
```css
.callout {
  @apply border-l-4 rounded-lg p-4 my-4;
}
.callout-note { @apply border-blue-500 bg-blue-50 dark:bg-blue-950/30; }
.callout-tip { @apply border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30; }
.callout-warning { @apply border-orange-500 bg-orange-50 dark:bg-orange-950/30; }
.callout-danger { @apply border-red-500 bg-red-50 dark:bg-red-950/30; }
/* ... other types */

.callout-header {
  @apply flex items-center gap-2 font-semibold cursor-pointer;
}
.callout-icon {
  @apply w-5 h-5;
}
.callout-content {
  @apply mt-2;
}
```

### Implementation Notes
- Prose components receive slot content, not raw markdown
- Need to parse first text node for `[!type]` pattern
- Foldable callouts use `v-show` for collapse/expand
- Falls back to standard blockquote if no callout pattern

---

## P2: Footnotes

### Obsidian Syntax
```markdown
This has a footnote[^1].

[^1]: The footnote content.

Inline footnotes also work.^[This is inline]
```

### Implementation

**Install plugin:**
```bash
pnpm add remark-footnotes
```

**`nuxt.config.ts`**
```typescript
content: {
  markdown: {
    remarkPlugins: ['remark-footnotes'],
  },
},
```

### Notes
- Plugin handles parsing and transforms to HTML
- Creates `<sup>` and `<section class="footnotes">` elements
- Style with Tailwind prose or custom CSS

---

## P3: Highlight Syntax `==text==`

### Obsidian Syntax
```markdown
This is ==highlighted text== in a sentence.
```

### Implementation

**Option A: Custom remark plugin**

**`server/plugins/markdown-highlight.ts`**
```typescript
import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('content:file:beforeParse', (file) => {
    if (file._extension === 'md') {
      // Transform ==text== to <mark>text</mark>
      file.body = file.body.replace(/==([^=]+)==/g, '<mark>$1</mark>')
    }
  })
})
```

**Option B: Use remark plugin**
```bash
pnpm add remark-mark-plus
```

**CSS styling:**
```css
mark {
  @apply bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded;
}
```

---

## P4: Comments `%% hidden %%`

### Obsidian Syntax
```markdown
This is visible %%but this is hidden%% text.

%%
Entire block is hidden.
Won't appear in output.
%%
```

### Implementation

**`server/plugins/markdown-comments.ts`**
```typescript
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('content:file:beforeParse', (file) => {
    if (file._extension === 'md') {
      // Remove inline comments: %%...%%
      file.body = file.body.replace(/%%[^%]*%%/g, '')

      // Remove block comments (multiline)
      file.body = file.body.replace(/%%[\s\S]*?%%/g, '')
    }
  })
})
```

### Notes
- Process before wiki-link transformation
- Block comments may span multiple lines
- Completely removes content (no HTML comment fallback)

---

## P5: Math/LaTeX

### Obsidian Syntax
```markdown
Inline: $e^{i\pi} + 1 = 0$

Block:
$$
\sum_{i=1}^{n} x_i = \frac{n(n+1)}{2}
$$
```

### Implementation

**Install dependencies:**
```bash
pnpm add rehype-katex katex
```

**`nuxt.config.ts`**
```typescript
content: {
  markdown: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: ['rehype-katex'],
  },
},
```

**CSS import (in `app.vue` or layout):**
```typescript
import 'katex/dist/katex.min.css'
```

### Notes
- KaTeX is faster than MathJax
- CSS must be imported for proper rendering
- Consider lazy-loading KaTeX CSS if math is rare

---

## P6: Note Embeds/Transclusion `![[note]]`

### Obsidian Syntax
```markdown
![[atomic-habits]]                    Full note embed
![[atomic-habits#Key Insights]]       Section embed
![[atomic-habits#^block-id]]          Block embed
```

### Implementation

**`server/utils/wikilinks.ts`** - Add embed regex:
```typescript
export const embedRegex = /!\[\[([^\]#|]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g
```

**Transform to MDC syntax:**
```typescript
![[atomic-habits]]
→ ::content-embed{slug="atomic-habits"}

![[atomic-habits#Key Insights]]
→ ::content-embed{slug="atomic-habits" section="key-insights"}
```

**`app/components/content/ContentEmbed.vue`**
```vue
<script setup lang="ts">
const props = defineProps<{
  slug: string
  section?: string
  caption?: string
}>()

const { data: content } = await useAsyncData(
  `embed-${props.slug}`,
  () => queryCollection('content')
    .where('stem', '=', props.slug)
    .select('title', 'body')
    .first()
)

// If section specified, filter body to that heading
const filteredBody = computed(() => {
  if (!props.section || !content.value?.body) return content.value?.body
  return extractSection(content.value.body, props.section)
})
</script>

<template>
  <div class="embed-container">
    <div class="embed-header">
      <NuxtLink :to="`/${slug}`" class="embed-link">
        {{ content?.title || slug }}
      </NuxtLink>
    </div>
    <div class="embed-content">
      <ContentRenderer v-if="filteredBody" :value="{ body: filteredBody }" />
    </div>
  </div>
</template>
```

### Anti-recursion
- Track embed depth with prop
- Max depth: 3 levels
- Show warning if exceeded

---

## P7: Block References

### Obsidian Syntax
```markdown
This is a referenceable block. ^my-block-id

[[note#^my-block-id]]           Link to block
![[note#^my-block-id]]          Embed block
```

### Implementation Approach

**Phase 1: Extract block IDs during parse**
```typescript
// In beforeParse hook
const blockIdRegex = /\s+\^([a-zA-Z0-9-]+)$/gm

// Store block ID → content mapping in metadata
```

**Phase 2: Index block IDs**
```typescript
// Build index: { slug: { blockId: lineContent } }
```

**Phase 3: Resolve in links**
```typescript
// In ProseA.vue, if href contains #^, resolve to block
```

### Notes
- Complex feature - consider deferring
- Requires indexing all content at build time
- Block IDs must be unique within a note

---

## P8: Aliases

### Obsidian Syntax
```yaml
---
title: Atomic Habits
aliases:
  - habits
  - habit-formation
  - atomic habits book
---
```

Then `[[habits]]` resolves to `/atomic-habits`.

### Implementation

**`content.config.ts`** - Add to schema:
```typescript
aliases: z.array(z.string()).optional(),
```

**`server/api/aliases.get.ts`** - Build alias index:
```typescript
export default defineEventHandler(async () => {
  const content = await queryCollection('content')
    .select('stem', 'aliases')
    .all()

  const aliasMap: Record<string, string> = {}
  for (const item of content) {
    if (item.aliases) {
      for (const alias of item.aliases) {
        aliasMap[normalizeSlug(alias)] = item.stem
      }
    }
  }
  return aliasMap
})
```

**`app/components/content/ProseA.vue`** - Resolve aliases:
```typescript
// In wiki-link resolution
const { data: aliasMap } = await useFetch('/api/aliases')
const resolvedSlug = aliasMap.value?.[slug] || slug
```

### Notes
- Cache alias map at build time
- ESLint rule should also check aliases

---

## P9: Image Sizing

### Obsidian Syntax
```markdown
![[image.png|640x480]]          Width x Height
![[image.png|300]]              Width only
![alt|300](url)                 External with size
```

### Implementation

**`modules/wikilinks.ts`** - Extend image handling:
```typescript
// Detect size suffix: |WxH or |W
const imageSizeRegex = /!\[\[([^\]|]+)\|(\d+)(?:x(\d+))?\]\]/g

// Transform to HTML with dimensions
![[image.png|300x200]]
→ <img src="/images/image.png" width="300" height="200" alt="image.png">
```

### Notes
- Simple regex transform
- Works with existing image handling
- External images need different regex

---

## Implementation Order

### Phase 1: Quick Wins
1. **P4: Comments** - Simple regex removal
2. **P3: Highlight** - Regex transform or plugin
3. **P9: Image sizing** - Extend existing transform

### Phase 2: Medium Effort
4. **P2: Footnotes** - Install and configure plugin
5. **P5: Math** - Install KaTeX, add CSS

### Phase 3: Larger Features
6. **P1: Callouts** - Custom ProseBlockquote component
7. **P8: Aliases** - Schema + index + resolution

### Phase 4: Complex Features
8. **P6: Embeds** - Content fetching + component
9. **P7: Block refs** - Full indexing system

---

## Files to Create/Modify Summary

### New Files
- `app/components/content/ProseBlockquote.vue` - Callouts
- `app/components/content/ContentEmbed.vue` - Note embeds
- `app/assets/css/callouts.css` - Callout styles
- `server/api/aliases.get.ts` - Alias index endpoint

### Modified Files
- `nuxt.config.ts` - Add remark/rehype plugins
- `content.config.ts` - Add aliases to schema
- `modules/wikilinks.ts` - Image sizing, embeds
- `server/plugins/wikilinks.ts` - Comments, highlights
- `app/components/content/ProseA.vue` - Alias resolution

### Dependencies to Add
```bash
pnpm add remark-footnotes remark-math rehype-katex katex
```

---

## Testing Strategy

Each feature should have:
1. **Unit tests** for transformation logic
2. **Test markdown file** in `content/` with examples
3. **Visual verification** in dev server

Test file example: `content/test-obsidian-features.md`
```markdown
---
title: Obsidian Feature Test
---

## Callouts
> [!note]
> Test note

> [!warning] Custom Title
> Test warning

## Highlights
This is ==highlighted== text.

## Math
Inline $x^2$ and block:
$$\sum_{i=1}^n i$$

## Comments
Visible %%hidden%% text.

## Footnotes
Test[^1] and inline^[inline note].

[^1]: Footnote content.
```
