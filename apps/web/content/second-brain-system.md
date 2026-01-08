---
title: "Second Brain System Guide"
type: evergreen
tags:
  - knowledge-management
  - meta
summary: "How this Second Brain works: note types, atomicity guidelines, MOC creation, and linking philosophy."
date: 2026-01-02
---

This is a personal knowledge base built on Zettelkasten principles. Structure emerges from links, not folders. Every note lives at the top level; type is just metadata.

## Philosophy

- **Flat structure** — No folder hierarchy. Find notes through search, links, and MOCs
- **Wiki-links are the architecture** — `[[slug]]` connections create the knowledge graph
- **Type is metadata** — A book note and an evergreen note are equals; type helps filtering, not organization

## Note Types

| Type | Purpose | When to Use |
|------|---------|-------------|
| `book`, `article`, `youtube`, `podcast` | External content capture | Capturing insights from sources with authors |
| `note` | Personal thoughts, ideas | Quick captures, unrefined thinking |
| `evergreen` | Permanent, refined ideas | Mature insights written in your own words |
| `map` | Maps of Content (MOCs) | Organizing 15+ related notes into navigable clusters |
| `quote` | Standalone quotes | Notable quotes worth preserving independently |

## When to Create an Atomic Note

**One idea = one note.** If you can't summarize it in a single sentence, consider splitting.

A note deserves to exist when it's:
- **Self-contained** — Understandable without reading other notes
- **In your own words** — Synthesized insight, not copy-paste from sources
- **Linkable** — Could connect to multiple other notes

### Decision Checklist

1. Does this contain multiple distinct insights? → **Split**
2. Could different parts link to different topics? → **Split**
3. Is this over 500 words with multiple H2 sections? → **Consider splitting**
4. Is this a single cohesive argument or concept? → **Keep together**

### Splitting Patterns

Break large topics into:
- **Definition notes** — What is X?
- **Benefit notes** — Why use X? When is it valuable?
- **Challenge notes** — What are the downsides or limitations?
- **How-to notes** — Practical application of X

## When to Create a Map of Content (MOC)

MOCs are meta-notes that curate and organize related notes. Unlike folders, a note can appear in multiple MOCs.

### Create a MOC When

- **15+ related notes** exist on a topic cluster
- **Navigation is hard** — You keep losing or forgetting related notes
- **Multiple perspectives** — The same notes could be organized differently for different purposes
- **Learning path needed** — Sequential ordering helps understanding

### MOC Structure

```markdown
Brief intro explaining the topic's scope.

## Section 1
- [[note-a]] — One-line description
- [[note-b]] — One-line description

## Section 2
- [[note-c]] — One-line description

## Related MOCs
- [[another-map]]
```

## Linking Philosophy

- **Link liberally** — Aim for 3-5+ wiki-links per note
- **Contextual links** — Embed links within body text, explaining the connection
- **Related section** — Add explicit `## Related` at the bottom for key connections
- **Backlinks matter** — Every link creates bidirectional discovery

## Workflow

1. **Capture** — Create note with frontmatter, dump thoughts in notes field
2. **Process** — Write summary, extract key insights in body
3. **Connect** — Add wiki-links to related notes
4. **Refine** — Evolve notes over time; split when they grow unwieldy
5. **Organize** — Create MOCs when topic clusters emerge

## Related

- [[evergreen-notes]] — The foundational methodology for permanent notes
- [[building-a-second-brain-and-zettelkasten]] — How BASB and Zettelkasten complement each other
