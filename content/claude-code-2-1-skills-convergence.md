---
title: "Claude Code 2.1: Skills, Slash Commands, and Subagents Converge"
type: note
tags:
  - claude-code
  - ai-agents
  - ai-tools
  - developer-experience
summary: "Claude Code 2.1 collapses the distinction between skills, slash commands, and subagents—skills can now fork into isolated contexts and specify their own model, making them the single abstraction for agent orchestration."
date: 2026-01-09
authors:
  - alexander-opalic
---

Claude Code 2.1 introduced two frontmatter options that fundamentally change how skills work: `context: fork` and `model:`. These additions blur the lines between what were previously distinct concepts.

## The Convergence

Before 2.1, Claude Code had three separate abstractions:

- **Slash commands**: User-triggered workflows requiring explicit `/command` invocation
- **Skills**: Context-aware capabilities that Claude activates automatically
- **Subagents**: Isolated agents spawned via the Task tool with their own context

After 2.1, skills absorb most of this functionality:

| Capability | Before | After |
|------------|--------|-------|
| User invocation | Slash commands | Skills (default `user-invocable: true`) |
| Isolated context | Task tool only | Skills with `context: fork` |
| Model selection | Task tool parameter | Skills with `model: haiku/sonnet/opus` |

## The New Frontmatter Options

### `context: fork`

Runs the skill in an isolated sub-agent with its own conversation history:

```yaml
---
name: research-topic
description: Deep research on a topic
context: fork
---
```

The main conversation stays clean—only the final result returns. Forked skills can invoke other forked skills, enabling recursive task trees.

### `model:`

Specifies which model runs the skill:

```yaml
---
name: quick-lint
description: Quick code linting check
model: haiku
context: fork
---
```

This enables cost optimization: run your main thread on Opus, research skills on Sonnet, and simple validation on Haiku.

## What Remains Different

The Task tool still wins for dynamic scenarios:

- **Dynamic prompts**: Task tool composes prompts at runtime based on context
- **Specialized agent types**: `Explore`, `Plan`, `general-purpose`, custom reviewers
- **Ad-hoc spawning**: No pre-definition required

Forked skills cannot use the Task tool themselves—their recursion comes from calling other forked skills, not spawning subagents.

## Mental Model

```text
Skills (with context: fork) = Static subagents with fixed prompts
Task tool subagents         = Dynamic subagents with runtime prompts
```

For repeatable workflows with known steps, forked skills now handle what previously required Task tool orchestration. Use Task tool when you need runtime flexibility or specialized agent types.

## Connections

- [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] - The foundational breakdown of Claude Code's seven extensibility layers, now partially obsoleted by this convergence
- [[writing-a-good-claude-md]] - Progressive disclosure principles apply equally to skill design—keep metadata light, load details on demand
