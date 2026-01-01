---
title: "12 Factor Agents"
type: article
url: "https://www.humanlayer.dev/blog/12-factor-agents"
tags:
  - ai-agents
  - llm
  - software-architecture
  - claude-code
  - developer-experience
summary: "A manifesto for building production-grade LLM agents, arguing that effective agents combine mostly deterministic software with strategic LLM decision-making rather than naive 'loop until solved' patterns."
notes: ""
date: 2026-01-01
---

## Core Insight

Agents get lost in extended context windows and spin out repeating failed approaches. The solution: integrate focused micro-agents into larger deterministic workflows rather than giving an LLM a bag of tools and looping until done.

> "Even as models support longer and longer context windows, you'll ALWAYS get better results with a small, focused prompt and context."

## The 12 Factors

1. **Natural Language to Tool Calls** - Convert user input to structured JSON representing next steps
2. **Own Your Prompts** - Treat prompts as first-class code; don't outsource prompt engineering
3. **Own Your Context Window** - Control how information is structured and presented to LLMs
4. **Tools Are Just Structured Outputs** - Tools are JSON that triggers deterministic code
5. **Unify Execution State and Business State** - Infer execution state from context
6. **Launch/Pause/Resume with Simple APIs** - Enable easy interruption and resumption
7. **Contact Humans with Tool Calls** - Use structured requests for human interaction
8. **Own Your Control Flow** - Build custom control structures for your specific use case
9. **Compact Errors into Context Window** - Let LLMs read and learn from failure messages
10. **Small, Focused Agents** - Keep agents to 3-20 steps; avoid monolithic designs
11. **Trigger from Anywhere** - Enable agents via Slack, email, webhooks, etc.
12. **Make Your Agent a Stateless Reducer** - Treat agents as pure functions on accumulated state

## Key Takeaways

- Effective agents are mostly just software with strategic LLM decision points
- Context window management is critical—smaller, focused prompts outperform large contexts
- Design for interruptibility and human-in-the-loop from the start
- Deterministic control flow with LLM decision nodes beats autonomous loops

## Related

Companion to [[context-efficient-backpressure]] (practical techniques for Factor 3) and [[writing-a-good-claude-md]] (applying Factor 2 to Claude Code configuration).
