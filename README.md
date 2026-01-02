# Second Brain

A personal knowledge base for capturing and connecting content using Zettelkasten-style wiki-links.

bla

## Features

- **Content Library**: Store articles, podcasts, books, videos, and notes
- **Wiki-Links**: Connect ideas with `[[slug]]` syntax
- **Knowledge Graph**: Visualize connections between notes
- **Full-Text Search**: Find anything with Cmd+K
- **Backlinks**: See what links to each note

## Setup

```bash
pnpm install
pnpm dev
```

## AI-Assisted Workflow

This project includes skills for AI coding assistants (Claude Code, Cursor, Windsurf, etc.) to help manage your knowledge base.

### Available Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **adding-notes** | "add a note", "save this article" | Create new notes from URLs with proper frontmatter |
| **linking-notes** | "find connections", "what should I link to" | Discover wiki-link opportunities |
| **reviewing-notes** | "review my notes", "find broken links" | Audit quality (missing summaries, orphans, broken links) |
| **managing-tags** | "clean up tags", "merge tags" | Consolidate similar tags, fix naming |
| **exploring-graph** | "analyze connections", "find orphans" | Graph analytics and insights |
| **summarizing-topic** | "what do I know about X" | Synthesize knowledge across notes |

### Example Workflows

**Adding Content:**
```text
"Add this article to my notes: https://example.com/interesting-article"
```

**Building Connections:**
```text
"Find connections for my note on Vue composables"
```

**Maintenance:**
```text
"Review my knowledge base for quality issues"
"Clean up my tags"
```

**Learning:**
```text
"What do I know about testing?"
"Analyze my knowledge graph"
```

### Skill Location

Skills are stored in `.claude/skills/` and work with any AI assistant that supports the skills/agents pattern.

## Content Types

- `article` - Web articles and blog posts
- `book` - Books and long-form reading
- `podcast` - Podcast episodes
- `youtube` - YouTube videos
- `movie` / `tv` - Films and shows
- `tweet` - Twitter/X posts
- `quote` - Memorable quotes
- `course` - Online courses
- `note` - Personal notes
- `evergreen` - Timeless reference notes

## Tech Stack

- [Nuxt 4](https://nuxt.com) - Vue framework
- [@nuxt/content v3](https://content.nuxt.com) - Markdown content with SQLite
- [@nuxt/ui v3](https://ui.nuxt.com) - UI components
- [D3.js](https://d3js.org) - Knowledge graph visualization
