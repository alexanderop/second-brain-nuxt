---
title: "TDD with GitHub Copilot"
type: article
url: "https://martinfowler.com/articles/exploring-gen-ai/06-tdd-with-coding-assistance.html"
tags:
  - test-driven-development
  - github-copilot
  - ai-assisted-development
  - developer-workflow
authors:
  - paul-sobocinski
summary: "TDD remains essential with AI coding assistants—unit tests provide fast, accurate feedback that catches LLM hallucinations, while incremental test-first development aligns with how AI performs best."
date: 2023-08-17
---

## Summary

Test-driven development gains new importance when working with AI coding assistants like GitHub Copilot. LLMs generate hallucinations and irrelevant code, making the fast feedback loop of unit tests critical for validation. TDD's incremental approach also aligns naturally with how LLMs perform best through chain-of-thought reasoning.

## Two Core Benefits of TDD with AI

### Fast and Accurate Feedback

Unit tests provide feedback that "nothing beats" for speed and accuracy. When Copilot generates code, tests immediately reveal whether the output matches intent or contains subtle errors that would otherwise slip through.

### Problem Decomposition

LLMs struggle to deliver exact functionality from single, complex prompts. TDD's divide-and-conquer approach—building functionality through small, testable increments—matches how AI assistants work best. Each test becomes a focused prompt that guides generation.

## TDD Workflow Adaptations

### Red Phase

Write descriptive test names using Given-When-Then structure. Provide context at the file's top to guide Copilot's completion. The test name itself becomes a specification that shapes the AI's output.

### Green Phase

Leverage expressive tests to guide implementation. Accept that Copilot may "backfill" untested functionality rather than taking the smallest possible step. The tests still catch deviations from expected behavior.

### Refactor Phase

Rely on IDE refactoring tools rather than Copilot for structural changes. Use Copilot Chat for localized improvements where the scope is clear and testable.

## Key Insight

"Garbage in, garbage out" applies to LLMs just as it does to data engineering. High-quality test suites maximize Copilot's effectiveness. The discipline of TDD creates the clean context that AI assistants need to generate accurate code.

## Connections

- [[tdd-with-github-copilot-in-vscode]] - Practical VS Code agent configuration for TDD workflows
- [[prompt-files-in-vscode]] - Custom instruction files that can encode TDD phase rules
- [[using-agents-in-vscode]] - Agent-based development patterns that complement TDD
