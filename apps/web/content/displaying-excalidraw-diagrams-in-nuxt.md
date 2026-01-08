---
title: "Displaying Excalidraw Diagrams in Nuxt"
type: note
tags:
  - nuxt
  - excalidraw
  - obsidian
  - svg
  - dark-mode
authors:
  - alexander-opalic
summary: "How I added Excalidraw diagram support to my Nuxt site, including failed attempts at build-time SVG conversion and the simpler solution using Obsidian's auto-export."
date: 2026-01-05
---

## The Problem

I created an Excalidraw diagram in Obsidian and embedded it in a markdown note using `![[diagram.excalidraw]]`. When rendered in Nuxt, nothing appeared—the wiki-link module only handled `[[slug]]` links, not image embeds.

## Understanding the File Format

Obsidian's Excalidraw plugin stores diagrams as `.excalidraw.md` files containing LZ-String compressed JSON in a `compressed-json` code block. The actual drawing data is base64-encoded and compressed.

## Attempt 1: Build-Time Decompression and SVG Conversion

My first approach was to decompress the JSON at build time and convert it to SVG using `excalidraw-to-svg`. This required:

- `lz-string` for decompression
- `excalidraw-to-svg` for rendering
- `@excalidraw/utils` for the conversion utilities

**Result:** Failed. The `excalidraw-to-svg` library uses jsdom to simulate a DOM, but it requires the `canvas` npm package which needs native dependencies (Cairo, Pango via Homebrew). Too much friction for a simple diagram.

## Attempt 2: Using Obsidian's Auto-Export

The Excalidraw plugin has a setting to auto-export SVG files alongside the `.excalidraw.md` files. With this enabled, Obsidian creates a `.svg` file automatically whenever you save a diagram.

**Result:** Success. The build script just copies these pre-rendered SVGs to `public/excalidraw/`.

## The SVG Theming Problem

The exported SVGs have hardcoded colors:
- White background: `fill="#ffffff"`
- Dark strokes/text: `stroke="#1e1e1e"`

This doesn't adapt to dark mode. My first instinct was to replace colors with `currentColor`, but that doesn't work—`<img>` tags load SVGs as static images without CSS context.

## Solution: CSS Filter for Dark Mode

1. **Build script** removes the white background rect via regex
2. **CSS** uses `filter: invert(1) hue-rotate(180deg)` for dark mode

```css
.excalidraw-diagram {
  max-height: 70vh;
  object-fit: contain;
}

.dark .excalidraw-diagram {
  filter: invert(1) hue-rotate(180deg);
}
```

The `hue-rotate(180deg)` preserves color relationships after inverting—without it, colors would shift unexpectedly.

## Final Implementation

**Files created/modified:**
- `scripts/build-excalidraw.ts` - Copies and processes SVGs
- `modules/wikilinks.ts` - Transforms `![[*.excalidraw]]` to `<img>` tags
- `app/assets/css/main.css` - Styling and dark mode support

**Pipeline:**
```text
Obsidian auto-export → content/Excalidraw/*.svg
Build script → public/excalidraw/*.svg (background removed)
Wiki-link transform → <img class="excalidraw-diagram" src="/excalidraw/slug.svg">
```

## Key Takeaway

When a "proper" solution requires complex dependencies, look for what the tool already provides. Obsidian's auto-export feature eliminated the need for build-time SVG generation entirely.

