---
title: "Understanding Claude Code's Full Stack: MCP, Skills, Subagents, and Hooks Explained"
type: article
url: "https://alexop.dev/posts/understanding-claude-code-full-stack/"
tags:
  - claude-code
  - ai-agents
  - developer-experience
  - ai-tools
  - productivity
authors:
  - alexander-opalic
summary: "A comprehensive breakdown of Claude Code's extensibility layers—MCP servers, CLAUDE.md files, slash commands, subagents, hooks, and skills—explaining when to use each component."
date: 2026-01-03
---

Claude Code functions as an AI agent orchestration platform, not just a coding assistant. Simon Willison describes it as "a tool for general computer automation." This article dissects each extensibility layer and when to use it.

## The Seven Layers

**Model Context Protocol (MCP)** connects external tools and systems. Add a Playwright server with `claude mcp add playwright npx @playwright/mcp@latest` and invoke it via `/mcp__playwright__create-test`.

**CLAUDE.md files** provide persistent project memory. They store coding standards, architecture decisions, and context that survives across sessions. See [[writing-a-good-claude-md]] for best practices.

**Slash commands** are user-triggered workflows. They require explicit invocation (`/command`) and support argument passing via `$ARGUMENTS` or `$1, $2`. Use them for repetitive multi-step tasks.

**Subagents** are specialized AI personalities that run in parallel. They prevent "context poisoning" by handling detailed implementation work in separate conversations. Each subagent gets its own system prompt, tools, and model selection.

**Hooks** automate event-driven actions. Configure them to trigger on events like `PostToolUse` to auto-lint after edits. They run shell commands without user confirmation.

**Skills** activate automatically based on task context. Unlike slash commands, they don't need explicit invocation—Claude detects when a skill applies and uses it.

## When to Use What

| Need | Solution |
|------|----------|
| External tool integration | MCP servers |
| Persistent project knowledge | CLAUDE.md |
| Explicit reusable workflow | Slash command |
| Parallel specialized work | Subagent |
| Automatic post-action behavior | Hook |
| Context-aware capabilities | Skill |

## Code Snippets

### Hook Configuration for Auto-Linting

This triggers automatic linting after any file edit:

```json
"hooks": {
  "PostToolUse": [{
    "matcher": "Edit|Write",
    "type": "command",
    "command": "pnpm lint:fix"
  }]
}
```

### Subagent System Prompt Pattern

Define a specialized agent with scoped tools:

```yaml
name: security-auditor
tools: Read, Grep, Bash
model: sonnet
```

## Connections

This builds on [[claude-code-is-a-platform-not-an-app]], which introduces the platform mindset. The subagent patterns align with [[building-effective-agents]] principles. For practical tips, see [[claude-code-best-practices]] and [[context-engineering-guide]].
