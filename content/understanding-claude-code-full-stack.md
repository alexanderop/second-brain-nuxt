---
title: "Understanding Claude Code's Full Stack"
type: article
url: "https://alexop.dev/posts/understanding-claude-code-full-stack/"
tags:
  - claude-code
  - ai-agents
  - automation
  - developer-tools
  - mcp
summary: "A comprehensive guide explaining how Claude Code's interconnected features—MCP, skills, subagents, and hooks—work together as a complete AI agent orchestration framework for general computer automation."
notes: ""
date: 2026-01-01
---

## Key Insight

> "Claude Code is, with hindsight, poorly named. It's not purely a coding tool: it's a tool for general computer automation."

## The Feature Stack

The article presents Claude Code's capabilities in the order they were introduced:

1. **MCP** — Connects external tools and data sources through a universal protocol
2. **Core Features** — Project memory (CLAUDE.md), slash commands, subagents, hooks
3. **Plugins** — Shareable bundles packaging commands, hooks, and skills
4. **Skills** — Context-aware capabilities that activate automatically

## Critical Distinctions

- **Skills and subagents** activate automatically; commands require manual triggering
- **Slash commands** provide explicit, repeatable workflows
- **Hooks** trigger on lifecycle events for automatic enforcement
- **Subagents** prevent "context poisoning" by isolating specialized work

## Takeaways

- Choose tools based on automation preference (automatic vs. manual control)
- Skills provide high context efficiency; MCPs consume significant context
- Combine features strategically to prevent context bloat
- Most developers use only one or two features and miss the orchestration potential

## Connections

This relates to [[vibe-coding-our-way-to-disaster]] in the broader discussion of AI-assisted development practices and the evolving role of developers as AI tools become more capable.
