---
title: "Building an AI Agent with TypeScript"
type: article
url: "https://cianfrani.dev/posts/building-an-ai-agent-with-typescript/"
tags:
  - ai-agents
  - llm
  - typescript
  - tool-calling
authors:
  - mark-anthony-cianfrani
summary: "A first-principles guide to building AI agents in TypeScript, covering LLM integration, conversation memory, tool calling, and agentic loops."
date: 2026-01-02
---

## Core Architecture

The article uses a body-system analogy: the LLM serves as the brain, the agent as the body, tools as limbs, and conversation context as a notebook tracking message history.

**Key components:**

- **Agent class** - Wraps the LLM provider (LM Studio or Anthropic) and manages the agentic loop
- **Conversation class** - Maintains message history with system, user, and assistant roles
- **Tool interface** - Standardized structure with name, description, parameters, and async execute method

## The Agentic Loop

The system runs iteratively:

1. Send prompt to the LLM
2. Check response for tool call requests
3. Execute requested tools
4. Reinject results into conversation history
5. Repeat until the LLM produces a final response

This pattern enables autonomous multi-step reasoning without manual intervention.

## Implementation Details

The author uses `qwen2.5-7b-instruct` with LM Studio for local inference on Apple Silicon. The architecture remains provider-agnostic—swapping to Anthropic requires only changing the agent class.

Example tools include a WeatherTool and ActivityTool, demonstrating how agents combine multiple tool calls to answer complex queries like "What should I do today given the weather?"

## Practical Notes

- TypeScript with strict configuration catches type errors early
- Bun serves as the runtime
- The interactive REPL uses Node's readline module
- Code will age as SDKs evolve, but the underlying patterns remain stable

## Connections

Implements concepts from [[agentic-design-patterns]], particularly the tool-use and ReAct patterns. Complements [[build-autonomous-agents-using-prompt-chaining-with-ai-primitives]] with a TypeScript-specific implementation. The emphasis on provider abstraction aligns with [[12-factor-agents]] principles.
