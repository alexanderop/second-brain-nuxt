---
title: "Spec-Driven Development with AI"
type: article
url: "https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/"
tags:
  - ai-agents
  - developer-experience
  - claude-code
  - best-practices
authors:
  - den-delimarsky
summary: "Spec Kit provides a structured four-phase workflow for AI coding agents, replacing vague prompting with specification-driven development."
date: 2025-09-02
---

## Summary

AI coding agents excel at pattern completion but struggle with ambiguous instructions. Spec Kit solves this by separating stable intent (what you want) from flexible implementation (how to build it). The toolkit guides developers through four phases: specify user journeys, plan architecture, generate tasks, then implement focused changes.

## Key Concepts

- **Specify phase** captures desired outcomes in non-technical terms—what the user should experience, not how code should work
- **Plan phase** locks in technical constraints: stack choices, security requirements, design system adherence
- **Tasks phase** breaks plans into concrete, reviewable work items an AI agent can execute
- **Separation of concerns** embeds organizational requirements upfront so generated code respects existing patterns

## Code Snippets

### Installation

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

### Workflow Commands

Inside a coding agent session:

```text
/specify  # Define user journeys and outcomes
/plan     # Establish architecture and constraints
/tasks    # Generate concrete work items
```

## Use Cases

Spec Kit works best for greenfield projects, new features in existing systems, and legacy modernization—anywhere vague prompting leads to code that looks right but doesn't integrate.

## Related

See also [[a-practical-guide-to-writing-technical-specs]] for spec-writing fundamentals and [[awesome-list-of-claude-code-tips-tricks-gotchas]] for community patterns around spec-driven workflows.
