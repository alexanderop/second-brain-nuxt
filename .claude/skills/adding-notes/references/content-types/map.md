# Map Notes (MOCs)

Maps of Content that curate related notes. Maps appear as **pink hexagons** on the knowledge graph.

## Detection

- Type override: `map`
- User wants to create a topic roadmap or learning path

## Frontmatter

```yaml
---
title: "Topic Roadmap"
type: map
tags:
  - learning-path
  - topic-area
summary: "A curated map connecting key resources about [topic]"
date: 2026-01-01
---
```

## Body Template

```markdown
This map connects essential resources for [topic description].

## Section 1

- [[related-note-1]] - Brief description
- [[related-note-2]] - Brief description

## Section 2

- [[related-note-3]] - Brief description
```

## Guidelines

- Notes linked via `[[wiki-links]]` become **members** of the map
- Members cluster around the map on graph visualization
- Notes can belong to **multiple maps**
- Keep maps focused: **3-10 members** ideal
- Use sections to organize by subtopic or learning sequence

## Graph Visualization

Maps appear as pink hexagons, making them easy to identify as hub nodes in the knowledge graph.
