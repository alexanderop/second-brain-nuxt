---
title: "Dynamic Context Discovery"
type: article
url: "https://cursor.com/blog/dynamic-context-discovery"
tags:
  - ai-agents
  - llm
  - context-management
  - developer-tools
authors:
  - jediah-katz
summary: "Coding agents perform better when they pull context on demand rather than receiving everything upfront—files serve as a simple, future-proof abstraction for this dynamic retrieval."
date: 2026-01-06
---

## Summary

Cursor's coding agents have shifted from static context (stuffing prompts with all available information) to dynamic context discovery—agents retrieve relevant information as needed. Files emerge as the core abstraction for this approach, providing a simple interface that agents can navigate with familiar tools like `tail` and `grep`.

## Key Strategies

Cursor implements five patterns for dynamic context:

1. **Tool Response Files** - Long outputs from shell commands or MCP calls write to files instead of truncating. Agents selectively read what they need.

2. **Chat History as Files** - When context windows fill up, summarization quality improves by giving agents access to full chat history as readable files.

3. **Agent Skills Discovery** - Skills (domain-specific capabilities) live as files. Agents find relevant skills through grep and semantic search rather than receiving all definitions upfront.

4. **MCP Tool Descriptions** - Tool descriptions sync to folders per server. A/B testing showed this approach reduced total agent tokens by 46.9% in runs calling MCP tools.

5. **Terminal Session Files** - Integrated terminal output syncs to the filesystem, letting agents query command history contextually.

## Why Files?

Files work because they're a simple abstraction both humans and LLMs already understand. Agents navigate them with familiar tools. The approach remains pragmatic—Cursor acknowledges uncertainty about final implementations while betting on files as a durable interface.

## Connections

- [[agentic-design-patterns]] - Covers memory and routing patterns theoretically; this article shows Cursor's production implementation of separating working memory from long-term memory
- [[what-is-prompt-chaining-in-ai-agents]] - Both address the same core problem: reducing context load per LLM call improves reliability
- [[the-markdown-programming-language]] - Mentions Cursor as an AI "compiler"; this explains the context management that makes such compilation efficient
