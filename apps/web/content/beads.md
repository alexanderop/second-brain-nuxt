---
title: "Beads"
type: github
url: "https://github.com/steveyegge/beads"
stars: 7600
language: "Go"
tags:
  - ai-agents
  - developer-tools
  - git
  - issue-tracking
authors:
  - steve-yegge
summary: "A distributed, git-backed graph issue tracker designed for AI coding agents, replacing markdown task lists with structured, dependency-aware workflows."
date: 2026-01-02
---

Beads replaces traditional markdown-based task planning with a structured system that maintains persistent memory across long-horizon development tasks. Issues live as JSONL files in a `.beads/` directory, version-controlled like code.

## Key Design Decisions

**Hash-based IDs** prevent merge conflicts in multi-agent workflows. Each issue gets an ID like `bd-a1b2` rather than sequential numbers, enabling parallel work without coordination.

**Dependency tracking** manages task relationships automatically. The system identifies which tasks are ready to work on based on their prerequisites.

**Hierarchical organization** supports nested structures: Epic → Task → Subtask. This matches how complex features break down in practice.

**Context optimization** uses semantic summarization of closed tasks. Rather than carrying full history, the system preserves what matters within a token budget.

## Technical Details

Written primarily in Go (93.7%). Available via npm, Homebrew, or Go package managers. Includes a SQLite cache layer with background sync daemon for performance.

Supports "stealth mode" for local-only operation when you don't want commits cluttering the repo.

## Connections

Complements the patterns in [[12-factor-agents]] and [[building-effective-agents]] by solving the memory and coordination problems those approaches surface. Traditional issue trackers assume human operators; Beads assumes AI agents that need structured, conflict-free task graphs.
