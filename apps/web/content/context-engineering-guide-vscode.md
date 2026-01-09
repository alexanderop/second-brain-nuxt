---
title: "Set Up a Context Engineering Flow in VS Code"
type: article
url: "https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide"
tags:
  - context-engineering
  - github-copilot
  - ai-tools
  - developer-experience
  - productivity
authors:
  - microsoft
summary: "A systematic approach to providing AI agents with targeted project information through custom instructions, planning agents, and structured workflows to improve code generation quality."
notes: ""
date: 2026-01-01
---

## Core Concept

Context engineering is a systematic approach to providing AI agents with targeted project information to improve the quality and accuracy of generated code.

## Three Primary Strategies

1. **Project-wide context curation** via custom instructions
2. **Implementation planning** through specialized agents
3. **Code generation** based on structured plans

## Key Techniques

### Documentation Foundation
Create Markdown files documenting product vision, system architecture, and contribution guidelines. These become reference materials for AI interactions.

### Custom Instructions File
A `.github/copilot-instructions.md` file automatically includes project context in all chat interactions, eliminating the need to re-explain requirements repeatedly.

### Planning Agents
Dedicated custom agents with planning-specific tools generate structured implementation plans using templates, ensuring consistency before coding begins.

### Workflow Handoffs
Use handoffs between agents to create guided transitions from planning through implementation to review stages.

## Best Practices

- Begin with minimal context and expand iteratively based on observed AI behavior
- Treat custom instructions and templates as living documents requiring regular refinement
- Maintain separate chat sessions for different work types to prevent context mixing
- Version control your context setup to track what works effectively

## Connections

This applies the same principles as [[writing-a-good-claude-md]] but for GitHub Copilot. Both emphasize progressive disclosure and keeping instructions focused.

The planning agents approach aligns with [[12-factor-agents]] factor #3 (Own Your Context Window) - controlling how information is structured and presented to LLMs.
