# Feature: Topic Depth Analysis

> Heatmap showing where you have deep vs shallow knowledge

## Overview

A treemap visualization on the `/stats` page that reveals knowledge depth across topics, helping identify gaps and track growth.

## Goals

- Find knowledge gaps
- Track growth over time
- Inform content planning (what to read/watch next)
- Showcase expertise areas

## Visualization

**Type:** Treemap heatmap

| Dimension | Represents |
|-----------|------------|
| Rectangle size | Note volume (count) |
| Rectangle color | Depth score (blue=shallow → orange/red=deep) |

**Filters:**
- Only show tags with 2+ notes (minimum threshold)
- Flat tag structure (no hierarchy)

## Depth Score Algorithm

Weighted scoring with **connections-heavy** approach (Zettelkasten philosophy):

| Signal | Weight | Description |
|--------|--------|-------------|
| Wiki-link connections | **High** | Outbound + inbound `[[links]]` |
| Note count | Medium | Number of notes with this tag |
| Key insights count | Low | `key_insights` array length in frontmatter |
| Word count | Low | Content length thresholds |
| Quotes presence | Low | `notable_quotes` in frontmatter |

### Proposed Formula

```typescript
function calculateDepthScore(tag: TagStats): number {
  const connectionScore = (tag.outboundLinks + tag.inboundLinks) * 3
  const noteScore = tag.noteCount * 2
  const insightsScore = tag.totalKeyInsights * 1
  const wordScore = Math.min(tag.avgWordCount / 500, 2) * 1
  const quotesScore = tag.notesWithQuotes * 0.5

  return connectionScore + noteScore + insightsScore + wordScore + quotesScore
}
```

## Interactions

### Main View (Tag Level)

- Treemap showing all qualifying tags
- Hover: Show tag name, note count, depth score
- Click: Drill down into tag

### Drill-Down View (Note Level)

- Sub-treemap of individual notes within the tag
- Each note as a cell, sized by its depth contribution
- Click note: Navigate to that note

### Gap Suggestions Panel

**Logic:**
1. Find outbound wiki-links from "deep" tags (high depth score)
2. Identify link targets that have few/no notes
3. Surface as "Topics to explore"

**Display:**
- Sidebar or bottom panel
- List of suggested topics with source context
- "You mention X frequently in [deep topic] but haven't explored it"

## Technical Considerations

### Data Requirements

Query all content to build:
```typescript
interface TagStats {
  tag: string
  noteCount: number
  outboundLinks: number  // links FROM notes with this tag
  inboundLinks: number   // links TO notes with this tag
  totalKeyInsights: number
  avgWordCount: number
  notesWithQuotes: number
}
```

### Visualization Library Options

- **D3.js treemap** - Full control, more work
- **ECharts treemap** - Good out-of-box, Vue integration
- **Recharts** - React-focused, less ideal for Vue
- **Custom SVG** - Lightweight but more effort

### Color Scale

Cool-to-warm gradient:
- `#3b82f6` (blue) → `#f59e0b` (amber) → `#ef4444` (red)
- Use `d3-scale` or similar for interpolation

## Future Enhancements (Out of Scope for v1)

- [ ] Time dimension (growth animation, time slider)
- [ ] Tag hierarchy/nesting
- [ ] Comparison with "ideal" knowledge profiles
- [ ] Export/share visualizations
- [ ] Mobile-optimized view

## Status

**Status:** Spec Complete
**Created:** 2026-01-09
**Priority:** TBD
