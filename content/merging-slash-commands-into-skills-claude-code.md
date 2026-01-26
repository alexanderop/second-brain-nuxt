---
title: "Merging Slash Commands into Skills in Claude Code"
description: "Claude Code has unified Slash Commands and Skills into a single abstraction, simplifying context management and enabling powerful subagent integrations."
authors: [thariq-shihipar]
type: article
topics: [claude-code, ai-tools, developer-experience]
source: https://x.com/trq212/status/2014836841846132761
---

Claude Code has merged Slash Commands into Skills. No migration is needed - existing slash commands in `~/.claude/commands` continue to work as normal.

## Why Combine Slash Commands and Skills?

Slash Commands were one of the first abstractions for managing context, serving as a form of [[progressive-disclosure]]. They ensured the model only loaded context when needed.

As model capabilities advanced, Skills proved to be the more powerful approach:

- **Dynamic context loading** - Skills allow the model to load context dynamically by reading relevant files
- **Multi-level context** - You can reference other files inside your SKILL.MD for multiple levels of dynamic context
- **Simplified mental model** - One abstraction instead of two (no separate SlashCommand Tool and Skill Tool)

## Invocation Control

For each skill, you can choose whether it should be:
- **User-invocable** - Can be invoked with slash command syntax (`/skillname`)
- **Model-invocable** - Can be called automatically by Claude
- **Both** (the default)

```yaml
# Prevent user invocation
user-invocable: false

# Prevent model invocation
disable-model-invocation: true
```

## Using Subagents with Skills

Skills naturally pair with subagents. Subagents allow you to execute skills while protecting your context window.

### Search Skills with the Explore Agent

Setting `agent: <agent-name>` spawns a subagent that loads the skill into its context.

**Example**: A Research skill that summarizes files using the Explore agent and returns the result.

### Memory Skills with Forked Context

Setting `context: fork` spins off a subagent with all your current context. Great for parallel operations.

**Example**: A memory skill to summarize your conversation and save it to a file - these tool results stay out of your main context since they're unrelated to the current work.

## Related

- [[claude-code]]
- [[ai-assisted-development]]
- [[context-engineering-guide]]
