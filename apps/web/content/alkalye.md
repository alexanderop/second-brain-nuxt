---
title: "Alkalye"
type: github
url: "https://github.com/ccssmnn/alkalye"
stars: 4
language: "TypeScript"
tags:
  - local-first
  - knowledge-management
  - typescript
authors:
  - carl-assmann
summary: "A local-first markdown editor PWA with E2E encryption, collaborative editing, and presentation mode."
date: 2026-01-04
---

## Overview

Alkalye is a markdown editor built as a progressive web app that works offline on desktop and mobile. Documents encrypt on the device before syncing, so data stays private. The editor supports real-time collaboration with visible cursor positions, making it useful for team writing sessions.

## Key Features

- **Local-first architecture**: Works offline, syncs when connected
- **End-to-end encryption**: Documents encrypt before leaving the device
- **Real-time collaboration**: Multi-user editing with cursor visibility
- **Slideshow mode**: Generate presentations from markdown using frontmatter config
- **Teleprompter**: Auto-scrolling mode for presentations
- **Focus mode**: Distraction-free writing environment

## Code Snippets

### Installation

```bash
bun install
cp .env.example .env
bunx jazz-sync run
bun run dev
```

### Stack

Built with Jazz (local-first sync and encryption), React 19, TanStack Router, Vite 7, Tailwind CSS with shadcn/ui, and CodeMirror 6.

## Technical Details

The app uses Jazz to handle the complexities of [[local-first-software]]: conflict resolution, sync, and encryption all happen at the framework level. Data stores in markdown frontmatter, keeping settings portable and exportable as standard `.md` files.

## Connections

Part of Carl Assmann's series of local-first PWAs, alongside Tilly (a relationship journal). Both use Jazz for sync and demonstrate how local-first apps can feel responsive while keeping data encrypted.
