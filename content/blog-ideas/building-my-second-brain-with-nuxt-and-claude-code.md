---
title: "Building My Second Brain with Nuxt Content and Claude Code"
status: idea
tags:
  - nuxt
  - claude-code
  - knowledge-management
  - ai-tools
  - nuxt-content
  - sqlite
core_idea: "A 3-part series on building a self-hosted Second Brain: motivation and architecture choices, deep technical dive into Nuxt Content's SQLite layer, and Claude Code automation that finally solved the capture problem."
target_audience: "Developers who consume lots of content and want a personalized knowledge management system they control."
created: 2026-01-09
updated: 2026-01-09
---

## Core Idea

Two years after reading "Building a Second Brain" and "How to Take Smart Notes," I finally built a system that works. The books had great principles, but capturing content was always the bottleneck. Claude Code changed that. This 3-part series covers the motivation, the technical implementation (deep dive into Nuxt Content's SQLite layer), and the Claude Code automation that makes it frictionless.

---

## Series Structure

### Part 1: Why I Built My Own Second Brain
**Focus:** Motivation + Architecture Decisions

### Part 2: Nuxt Content's SQLite Superpowers
**Focus:** Technical deep-dive with code snippets

### Part 3: Claude Code as Your Knowledge Assistant
**Focus:** Skills, automation, daily workflow

---

## Part 1: Why I Built My Own Second Brain

### 1.1 The Capture Problem
- Read "Building a Second Brain" by Tiago Forte and "How to Take Smart Notes" 2 years ago
- Love consuming content: podcasts, articles, YouTube, books
- The struggle: always forgetting where I learned something
- For writing blog posts, I'd know I read about a topic somewhere but couldn't find it
- Traditional note-taking apps make capture too manual and tedious
- The CODE framework (Capture, Organize, Distill, Express) breaks down at step 1

### 1.2 Why Not Just Use Obsidian?
- Obsidian + Claude Code is a valid option (link to workflows people use)
- But I wanted:
  - A public-facing site I control and can deploy to Vercel
  - Custom features like knowledge graph visualization, stats dashboard
  - The ability to style and extend without plugin limitations
  - Dog-fooding my Nuxt skills
- Trade-off: more work upfront, full control forever

### 1.3 The Architecture
- Flat file structure—no folders, just `content/*.md`
- Type is frontmatter metadata, not directory
- Wiki-links (`[[slug]]`) as the connective tissue
- Schema validation for consistent structure

📸 **Screenshots to add:**
- Knowledge graph visualization
- Stats dashboard
- Example note with wiki-links rendered

---

## Part 2: Nuxt Content's SQLite Superpowers

### 2.1 How Nuxt Content v3 Uses SQLite
- Under the hood: content compiled to SQLite database
- Why this matters for a Second Brain:
  - Query content like a real database
  - Full-text search without external services
  - Relationships and joins possible
- The `queryCollection()` API

### 2.2 Building the Backlinks System
- The challenge: find all notes that link TO this note
- Server endpoint that indexes wiki-links at build time
- Code walkthrough: `server/api/backlinks.get.ts`

```ts
// Code snippet: backlinks API endpoint
```

### 2.3 The Mentions API
- Beyond explicit wiki-links: find title/text mentions
- Catching references you forgot to link
- Code walkthrough: `server/api/mentions.get.ts`

```ts
// Code snippet: mentions API endpoint
```

### 2.4 Custom Wiki-Link Remark Plugin
- How `[[slug]]` becomes clickable links
- The remark plugin architecture
- Code walkthrough: `modules/wikilinks/`

```ts
// Code snippet: remark plugin for wiki-links
```

### 2.5 Schema Validation with content.config.ts
- Enforcing frontmatter consistency
- Different fields for different content types
- Validation that external content requires authors

```ts
// Code snippet: content schema definition
```

### 2.6 The Knowledge Graph API
- D3.js force-directed graph visualization
- Server endpoint returning nodes and edges
- How connection counts are calculated

```ts
// Code snippet: graph API endpoint
```

📸 **Screenshots to add:**
- SQLite query in action (dev tools)
- Backlinks rendered on a note page
- Graph visualization with filters

---

## Part 3: Claude Code as Your Knowledge Assistant

### 3.1 The CLAUDE.md Foundation
- Persistent context across sessions
- Teaching Claude your schema, conventions, existing notes
- Why this is the unlock for automation

### 3.2 The Skills System
- 15+ custom skills that handle different workflows
- Skill anatomy: SKILL.md + references
- How skills compose together

### 3.3 Example: Adding a YouTube Video
- Step-by-step what happens:
  1. User pastes link + brief context
  2. Claude fetches transcript
  3. Extracts key insights
  4. Finds or creates author profile
  5. Generates wiki-links to related notes
  6. Creates properly formatted markdown file
- Before/after: manual vs. automated capture

### 3.4 The Note Enhancement Skills
- Blinkist-style summaries for books
- Automatic wiki-link discovery
- Tag management and consolidation
- MOC curation

### 3.5 Daily Workflow in Practice
- Paste a link, describe what resonated
- "What do I know about X?" → synthesized answer
- Review and connect: the weekly maintenance
- Result: actually capturing things instead of intending to "add it later"

### 3.6 Trade-offs and Lessons Learned
- Started too complex—simplify early
- Flat structure took courage but paid off
- Honest assessment vs. just using Obsidian
- What I'd do differently

📸 **Screenshots to add:**
- Claude Code adding a note (terminal)
- Before/after of a raw capture vs. enhanced note
- Skills list in action

---

## Source Notes

- [[building-a-second-brain]] — The book that started this journey
- [[how-to-take-smart-notes]] — Zettelkasten methodology behind wiki-links
- [[second-brain-system]] — The philosophy of this specific implementation
- [[obsidian-claude-code-workflows]] — Alternative approaches people use
- [[teaching-claude-code-my-obsidian-vault]] — CLAUDE.md pattern for persistent context
- [[building-a-second-brain-and-zettelkasten]] — How the two methodologies combine

## Code Files to Reference

- `modules/wikilinks/` — Custom remark plugin
- `server/api/backlinks.get.ts` — Backlinks API
- `server/api/mentions.get.ts` — Mentions API
- `server/api/graph.get.ts` — Knowledge graph data
- `content.config.ts` — Schema definitions
- `.claude/skills/adding-notes/SKILL.md` — Example skill

## Draft Sections

[None yet]

## Resolved Decisions

- ✅ **Series format:** 3 parts (Motivation → Technical → Automation)
- ✅ **SQLite depth:** Deep dive with code snippets
- ✅ **Screenshots:** User will add (placeholders marked with 📸)
- ✅ **Code snippets:** Yes, for remark plugin, APIs, and schema
