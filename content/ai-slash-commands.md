---
title: "The Practical Guide to AI Slash Commands"
type: article
url: "https://catalins.tech/ai-slash-commands/"
tags:
  - claude-code
  - ai-tools
  - developer-experience
  - productivity
authors:
  - catalin-pit
summary: "Slash commands turn repetitive AI prompts into reusable, instantly-triggerable shortcuts—store them once, invoke them forever across Claude Code, Cursor, Gemini, and Codex."
date: 2026-02-02
---

Slash commands let you define custom commands for repeatable processes. Instead of constantly retrieving stored prompts and pasting them manually, you create a command file once and invoke it by name.

## How They Work

Command files require frontmatter metadata:
- **Description** of what the command does
- **Argument hints** for expected parameters
- **Allowed tools** the agent can execute
- **Model designation** (optional)

The filename maps directly to the command name. `fix-pr-comments.md` becomes `/fix-pr-comments`.

## When to Use Them

- Manual workflow triggering needed
- Simple, repetitive tasks
- Frequent prompt reuse

## Directory Locations by Tool

| Tool | Global Commands | Project Commands |
|------|-----------------|------------------|
| Claude Code | `~/.claude/commands` | `project/.claude/commands` |
| Cursor | `~/.cursor/commands` | `project/.cursor/commands` |
| Gemini | `~/.gemini/commands` | `project/.gemini/commands` |
| Codex | `~/.codex/prompts` | `project/.codex/prompts` |
| OpenCode | `~/.config/opencode/commands/` | `.opencode/commands/` |

Note: Some platforms like Codex have deprecated this feature.

## Connections

- [[the-six-levels-of-claude-code-slash-commands]] - Explores slash commands as a progression from saved prompts to full orchestration platforms
- [[claude-code-skills]] - Skills are the evolution of slash commands in Claude Code, with automatic semantic triggering
- [[merging-slash-commands-into-skills-claude-code]] - Explains how Claude Code unified slash commands and skills into a single abstraction
