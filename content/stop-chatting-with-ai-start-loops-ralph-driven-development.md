---
title: "Stop Chatting with AI. Start Loops (Ralph Driven Development)"
type: article
url: "https://lukeparker.dev/stop-chatting-with-ai-start-loops-ralph-driven-development"
tags:
  - ai-agents
  - developer-experience
  - prompt-engineering
authors:
  - luke-parker
summary: "Replace interactive AI chat with structured execution loops—invest heavily in planning, dump full context each iteration, and let verification backpressure catch errors before they compound."
date: 2026-01-02
---

## Core Insight

Typing creates friction that filters out context. Lost context causes hallucinations. The fix: speak your plans into existence, then run stateless loops where agents re-read everything each iteration.

## The 5-Phase Methodology

**1. Planning Phase**
Invest substantial time (1+ hours) building a detailed `plan.md` before writing code. Use voice-to-text (handy.computer) to capture thoughts without the friction of typing.

**2. Ralph Driven Development**
Bad AI results stem from bad prompts, bad context, or bad data access. Fix the prompt, not just the code. Named after [[ralph-wiggum-as-a-software-engineer|Geoffrey Huntley's framework]].

**3. Execution Loop**
Agents re-read full context each iteration, preventing drift. Single task per iteration. Shell loops (Bash/PowerShell) automate the cycle.

**4. Verification Backpressure**
Strict compilation rules and CLI verification reject errors before commits. This [[context-efficient-backpressure|backpressure]] keeps the codebase viable.

**5. Brownfield Application**
Human-in-the-loop review preserves viability for legacy codebases. Not everything can be fully automated.

## Practical Setup

- **handy.computer**: Offline speech-to-text for rapid planning
- **opencode.ai**: Terminal agent runner
- **AGENTS.md**: Store operational insights for agents to reference
- **CLI tools over MCP**: Simpler, more portable

## Connections

Builds on [[agentic-design-patterns]] and prompt chaining patterns from [[what-is-prompt-chaining-in-ai-agents]]. The backpressure concept aligns with [[context-efficient-backpressure]].
