# Obsidian Feature Parity - Implementation Roadmap

## Priority Order (Impact vs Effort)

| Priority | Feature | Impact | Effort | Status |
|----------|---------|--------|--------|--------|
| **P1** | Heading Links `[[slug#heading]]` | High | Low | ⬜ Pending |
| **P2** | Callouts/Admonitions | High | Medium | ⬜ Pending |
| **P3** | TOC Sidebar | High | Medium | ⬜ Pending |
| **P4** | Embeds `![[slug]]` | Medium | Medium | ⬜ Pending |
| **P5** | Aliases | Medium | Medium | ⬜ Pending |

---

## P1: Heading Links `[[slug#heading]]`

### Goal
Support linking to specific sections: `[[atomic-habits#key-insights]]`

### Files to Modify
- `server/utils/wikilinks.ts` - Extend regex and transform function
- `tests/unit/utils/wikilinks.test.ts` - Add test cases

### Implementation

**1. Update regex pattern:**
```typescript
// FROM:
export const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

// TO:
export const wikiLinkRegex = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g
//                                 ─────────   ──────────   ───────────
//                                   slug       heading     display text
```

**2. Update transform function:**
```typescript
export function transformWikiLink(
  slug: string,
  heading?: string,
  displayText?: string
): string {
  const normalizedSlug = normalizeSlug(slug)
  const anchor = heading ? `#${normalizeSlug(heading)}` : ''
  const text = displayText?.trim() || slug.trim()
  return `[${text}](/${normalizedSlug}${anchor}){.wiki-link}`
}
```

### Test Cases
```
[[note#section]]           → [note](/note#section){.wiki-link}
[[note#section|Display]]   → [Display](/note#section){.wiki-link}
[[My Note#Key Ideas]]      → [My Note](/my-note#key-ideas){.wiki-link}
```

---

## P2: Callouts/Admonitions

### Goal
Support Obsidian-style callouts:
```markdown
> [!NOTE]
> This is important information

> [!WARNING] Custom Title
> Be careful here
```

### Callout Types
| Type | Color | Use Case |
|------|-------|----------|
| `NOTE` | Blue | General information |
| `TIP` | Green | Helpful advice |
| `WARNING` | Yellow | Caution needed |
| `DANGER` | Red | Critical warning |
| `INFO` | Blue | Informational |
| `QUOTE` | Gray | Quotation styling |

### Files to Create
- `app/components/content/ProseBlockquote.vue` - Override default blockquote
- `app/assets/css/callouts.css` - Callout styles

### Implementation
Create `ProseBlockquote.vue` that:
1. Detects `[!TYPE]` pattern in first line
2. Extracts optional custom title
3. Renders styled callout box with icon
4. Falls back to normal blockquote if no pattern

---

## P3: Table of Contents Sidebar

### Goal
Sticky sidebar showing document outline with scroll-spy highlighting.

### Files to Create
- `app/composables/useTableOfContents.ts` - Extract headings from minimark AST
- `app/components/ContentTableOfContents.vue` - TOC UI component

### Files to Modify
- `app/pages/[...slug].vue` - Add TOC to layout

### Implementation

**Composable responsibilities:**
1. Walk minimark body to extract h2/h3/h4 headings
2. Generate nested heading structure
3. Track active heading via IntersectionObserver

**Component features:**
- "On this page" header
- Indented heading hierarchy
- Smooth scroll on click
- Active heading highlight
- Only shows if >2 headings exist

**Layout change:**
```vue
<div class="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
  <article>...</article>
  <aside class="hidden lg:block sticky top-20">
    <ContentTableOfContents :body="page.body" />
  </aside>
</div>
```

---

## P4: Embeds/Transclusion `![[slug]]`

### Goal
Embed full content of another note inline: `![[atomic-habits]]`

### Files to Modify
- `server/utils/wikilinks.ts` - Add embed regex
- `server/plugins/wikilinks.ts` - Process embeds before links

### Files to Create
- `app/components/content/Embed.vue` - Render embedded content

### Implementation

**1. Regex:**
```typescript
export const embedRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
```

**2. Transform to MDC syntax:**
```typescript
![[atomic-habits]]
→ ::embed{slug="atomic-habits"}

![[atomic-habits|My Notes on Habits]]
→ ::embed{slug="atomic-habits" caption="My Notes on Habits"}
```

**3. Embed component:**
- Query content by slug
- Render with ContentRenderer
- Show link back to original
- Prevent circular embeds (max depth: 3)

---

## P5: Aliases

### Goal
Alternative names for notes that resolve to the same content.

### Schema Change
```typescript
// content.config.ts
aliases: z.array(z.string()).optional()
```

### Example Usage
```yaml
---
title: Atomic Habits
aliases:
  - habits
  - habit-formation
---
```

Then `[[habits]]` resolves to `/atomic-habits`.

### Files to Modify
- `content.config.ts` - Add aliases to schema
- `app/components/content/ProseA.vue` - Resolve aliases in lookup

### Files to Create
- `server/api/aliases.get.ts` - Build alias→slug index

---

## Current State (What Exists)

| Feature | Status |
|---------|--------|
| Wiki-links `[[slug]]` | ✅ Implemented |
| Wiki-links with display text `[[slug\|text]]` | ✅ Implemented |
| Backlinks | ✅ Implemented |
| Knowledge Graph | ✅ Implemented |
| Tags | ✅ Implemented |
| Full-text Search | ✅ Implemented |
| Unlinked Mentions | ✅ Implemented |

---

## Architecture Notes

### Wiki-link Pipeline
```
Markdown → server/plugins/wikilinks.ts → Regex Transform → ProseA.vue
```

### Key Files
- `server/utils/wikilinks.ts` - Core transformation logic
- `server/plugins/wikilinks.ts` - Nitro hook (beforeParse)
- `app/components/content/ProseA.vue` - Link rendering + previews
- `app/components/content/Mermaid.vue` - Pattern for custom content components

### Minimark Body Format
Body is array-based AST: `['h2', { id: 'foo' }, 'Heading Text']`
Must use `.select('body')` - not included in default queries.
