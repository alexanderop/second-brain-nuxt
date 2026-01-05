---
title: "Claude Agent SDK [Full Workshop]"
type: talk
url: "https://www.youtube.com/watch?v=TqC1qOfiVcQ"
conference: "AI Engineer 2025"
tags:
  - claude-code
  - ai-agents
  - llm
  - developer-experience
  - software-architecture
authors:
  - thariq-shihipar
summary: "Bash is the most powerful agent tool. The Claude Agent SDK packages Claude Code's battle-tested patterns—tools, file system, skills, sandboxing—for building coding and non-coding agents alike."
date: 2026-01-05
---

## Overview

Anthropic built the Claude Agent SDK by extracting patterns from Claude Code. Engineers kept rebuilding the same agent harness components: tool loops, file systems, prompts, skills, sub-agents, memory. The SDK packages these lessons into an opinionated framework for building production agents.

## Key Arguments

### Bash Is All You Need

The bash tool made Claude Code exceptional. It functions as the first "code mode"—enabling programmatic tool composition before formal code mode existed.

What bash enables:
- **Dynamic scripts**: Generate and execute code on-demand rather than hardcoding tools
- **Composability**: Pipe outputs, store results to files, chain operations
- **Existing software**: Use ffmpeg, jq, grep, LibreOffice without building integrations
- **Self-checking**: Save intermediate results to verify work

Without bash, an email agent searching for "how much did I spend on ridesharing?" must process 100 emails in context. With bash, it can grep for prices, store them to a file, and sum them—checking its work at each step.

### Code Generation for Non-Coding Tasks

Claude Code succeeds at non-coding work because it generates code to solve problems.

When asked about weather and outfit recommendations, Claude Code might:
1. Write a script to fetch a weather API
2. Get location dynamically from IP address
3. Call a sub-agent for wardrobe recommendations
4. Compose everything into a reusable tool

This pattern—composing APIs via generated code—applies to email processing, data analysis, and document generation. The SDK's Office agent and dashboard builder examples use this approach.

### The Three Agent Actions

Every agent operation falls into tools, bash, or codegen:

| Method | Pros | Cons |
|--------|------|------|
| **Tools** | Structured, reliable, minimal retries | High context usage, not composable |
| **Bash** | Composable, low context, uses existing software | Discovery latency, slightly lower call rates |
| **Codegen** | Highly composable, dynamic, API composition | Longest execution, needs linking/compilation |

Use tools for atomic, irreversible actions (write file, send email). Use bash for composable workflows (search, lint, memory). Use codegen for dynamic logic and API composition.

### The Agent Loop Pattern

Three phases define effective agent design:

1. **Gather context** - Find relevant information (grep files, search emails)
2. **Take action** - Execute work (tools, bash, codegen)
3. **Verify work** - Confirm results (lint, compile, execute)

The verification step determines agent viability. Coding agents verify via linting and compilation. Research agents verify via source citation. Agents without strong verification remain unreliable.

### Swiss Cheese Security

Agent security uses layered defenses:

1. **Model alignment** - Training to avoid harmful actions
2. **Harness controls** - Permission prompts, bash parsing
3. **Sandboxing** - Network isolation, file system boundaries

The "lethal trifecta" attackers need: code execution, file system access, and data exfiltration. Network sandboxing blocks the third requirement.

## Notable Quotes

> "Bash is what makes Claude Code so good. If you were designing an agent harness, you'd have a search tool and a lint tool and an execute tool. Every time you thought of a new use case, you'd need another tool. Instead, Claude just uses grep."
> — Thariq Shihipar

> "The number one meta-learning for designing an agent loop: read the transcripts over and over again. Every time you see the agent running, read it and figure out—what is it doing? Why? Can I help it somehow?"

## Practical Takeaways

- Design agents around verification: if you can't verify the output, the agent will struggle
- Use tools for actions requiring user approval; use bash for everything composable
- Skills are folders the agent can read—just files with expertise baked in
- Think context engineering, not just prompts: tools, files, and scripts shape behavior
- For workflows, still use the SDK—even structured tasks benefit from bash composability

## Connections

- [[12-factor-agents]] - Shares the philosophy of small, focused agents with deterministic control flow and strategic LLM decision points
- [[boris-cherny-on-what-grew-his-career-and-building-at-anthropic]] - Another Anthropic engineer's perspective on Claude Code's architecture and impact
- [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] - Explains the extensibility layers that the Agent SDK builds upon
