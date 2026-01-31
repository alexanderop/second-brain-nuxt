---
title: "Copilot Subagents: Parallel Orchestration Demo"
type: reddit
url: "https://www.reddit.com/r/GithubCopilot/comments/1qqzknq/subagents_are_now_incredibly_functional_its_wild/"
tags:
  - github-copilot
  - ai-agents
  - multi-model
  - context-engineering
  - vs-code
authors:
  - u-other-tune-947
summary: "Custom subagents with explicit model assignments and parallel execution now work in VS Code Insiders—conserving 95% of context window by delegating tasks to specialized agents."
date: 2026-01-30
---

## Summary

A VS Code Insiders user demonstrates a multi-agent orchestration system using GitHub Copilot's new custom subagent features. The setup uses different models for different roles—Sonnet 4.5 for orchestration, Gemini 3 Flash for exploration, GPT 5.2 for research—running in parallel while preserving main context.

## Key Points from OP

- **Parallel subagent execution** now works in VS Code Insiders (Jan 2026 build)
- Tasks that consumed 80K tokens in a single agent now use under 4K via delegation
- Main orchestrator (Atlas) only delegates and synthesizes—no direct work
- Subagents are defined via `[agent-name].agent.md` files with model assignments

## Agent Architecture

| Agent | Model | Role |
|-------|-------|------|
| **Atlas** | Sonnet 4.5 | Orchestrator—delegates and synthesizes |
| **Prometheus** | GPT 5.2 High | Deep research and planning, writes to plan directories |
| **Oracle** | GPT 5.2 | Research and analysis |
| **Sisyphus** | Sonnet 4.5 | Task execution from plans |
| **Explorer** | Gemini 3 Flash | File discovery, web fetches |
| **Code Review** | GPT 5.2 | Autonomous code review |
| **Frontend Engineer** | Gemini 3 Pro | UI/UX specialist |

## Notable Comments

> "If anyone is wondering on the technicalities, they are just documentation files, in markdown (.md) format, which Copilot recognizes and auto-loads them on every message, if you name them `agent-name.agent.md`. The sub-agents can take Copilot to the next level in regards to its context-window."
>
> — u/SourceCodeplz (2 points)

> "What's interesting to me is not the 'parallel execution' aspect but more the context size optimization. Big functional prompts or zero-to-POC prompts are probably going to benefit the most from the system. But what about 'fix that error' prompts?"
>
> — u/WSATX (1 point)

## Model Assignment Caveat

Several commenters report that **model assignments in subagent definitions may be ignored**—subagents appear to use the main chat's model regardless of what's defined in their `.agent.md` file. One commenter tested with `reasoningEffort: xhigh` (only supported by GPT 5.2 Codex) and found subagents ran without errors even when assigned GPT 5-mini, suggesting the model setting was discarded.

## Discussion Takeaways

- **Context conservation** is the primary value—not just parallelism
- Subagent cost structure unclear: some claim subagents don't consume additional premium requests
- Enabling requires: `"chat.customAgentInSubagent.enabled": true` in VS Code settings
- Nested subagents (sub-sub-agents) not yet supported
- Features currently Insiders-only, expected in public VS Code within weeks

## Resources

- [Github-Copilot-Atlas repo](https://github.com/bigguy345/Github-Copilot-Atlas) — OP's agent configuration
- [copilot-orchestra](https://github.com/ShepAlderson/copilot-orchestra) — Original inspiration
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) — Naming conventions source

## Connections

- [[mastering-subagents-in-vs-code-copilot]] — Covers the same `#runSubagent` feature with isolation and worktree concepts
- [[the-context-window-problem]] — Explains why context conservation matters: enterprise codebases exceed model limits
- [[using-agents-in-vscode]] — Official VS Code agent documentation covering the four execution modes
