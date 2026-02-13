---
title: "The Complete Guide to Building Skills for Claude"
type: article
url: "https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf"
tags:
  - claude-code
  - skills
  - ai-agents
  - mcp
  - developer-experience
authors:
  - anthropic
summary: "Effective Claude skills follow progressive disclosure across three levels—frontmatter for triggering, SKILL.md for instructions, and linked references for depth—and pair with MCP servers to turn raw tool access into reliable, guided workflows."
date: 2026-02-13
---

## Summary

Anthropic's official guide covers the full lifecycle of building skills for Claude: planning use cases, structuring the skill folder, writing effective frontmatter and instructions, testing for triggering accuracy, and distributing skills to users or organizations. The guide positions skills as the knowledge layer that sits on top of MCP's connectivity layer—MCP gives Claude access to tools, skills teach Claude how to use them well.

## Key Concepts

- **Progressive disclosure** operates at three levels: YAML frontmatter (always loaded, determines when the skill activates), SKILL.md body (loaded when relevant), and linked reference files (loaded on demand). This minimizes token usage while preserving specialized expertise.
- **The kitchen analogy**: MCP provides the professional kitchen (tools, ingredients, equipment). Skills provide the recipes (step-by-step workflows). Together they let users accomplish complex tasks without figuring out every step themselves.
- **Three skill categories**: Document & Asset Creation (consistent output generation), Workflow Automation (multi-step processes with validation gates), and MCP Enhancement (workflow guidance layered on top of tool access).
- **Frontmatter is the most important part**: The description field determines whether Claude loads your skill. It must include both what the skill does and when to use it, with specific trigger phrases users would actually say.

## Workflow Patterns

The guide documents five reusable patterns for skill architecture:

1. **Sequential workflow orchestration** — explicit step ordering with dependencies and rollback instructions
2. **Multi-MCP coordination** — workflows spanning multiple services with clear phase separation and data passing
3. **Iterative refinement** — draft-validate-improve loops with explicit quality criteria and termination conditions
4. **Context-aware tool selection** — decision trees that route to different tools based on input characteristics
5. **Domain-specific intelligence** — embedding specialized knowledge (compliance rules, best practices) directly into the workflow logic

::mermaid
<pre>
flowchart LR
    Plan[Plan Use Cases] --> Structure[Structure Skill Folder]
    Structure --> Write[Write SKILL.md]
    Write --> Test[Test Triggering]
    Test --> Iterate[Iterate on Feedback]
    Iterate -->|Under-triggers| Write
    Iterate -->|Over-triggers| Write
    Iterate --> Distribute[Distribute]
</pre>
::

## Testing Strategy

Testing covers three areas: **triggering tests** (does the skill load for the right queries and stay silent for unrelated ones), **functional tests** (does it produce correct outputs with successful API calls), and **performance comparison** (does the skill reduce back-and-forth messages, token consumption, and failed calls versus baseline). The guide recommends iterating on a single challenging task until Claude succeeds, then extracting the winning approach into a skill.

## Troubleshooting Highlights

- Skills that won't trigger usually have vague descriptions missing specific user phrases
- Skills that trigger too often need negative triggers and narrower scope definitions
- Instructions not followed often means they're too verbose—move detail to `references/` and keep SKILL.md under 5,000 words
- For critical validations, bundle a script rather than relying on language instructions: code is deterministic, language interpretation isn't

## Connections

- [[claude-code-skills]] - The official Skills documentation this guide expands on with deeper patterns and troubleshooting
- [[claude-code-2-1-skills-universal-extension]] - Explores how skills evolved into Claude Code's unified extension mechanism
- [[how-we-built-a-company-wide-knowledge-layer-with-claude-skills]] - A real-world case study of building institutional knowledge distribution with the skill patterns described in this guide
