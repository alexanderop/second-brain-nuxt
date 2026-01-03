---
title: "Vue 3 Testing Pyramid: A Practical Guide with Vitest Browser Mode"
type: article
url: "https://alexop.dev/posts/vue3_testing_pyramid_vitest_browser_mode/"
tags:
  - vue
  - testing
  - vitest
  - browser-mode
  - integration-testing
authors:
  - alexander-opalic
summary: "A practical testing strategy for Vue 3 that inverts the traditional pyramid—prioritizing integration tests (~70%) over unit tests, using Vitest browser mode for real browser execution and 4x faster performance than JSDOM."
notes: ""
date: 2026-01-01
---

## Core Strategy

An inverted testing pyramid where **integration tests form ~70%** of the test suite, composable unit tests ~20%, and accessibility/visual tests ~10%. This emphasizes real-world user flows over isolated unit tests.

## Three Testing Layers

1. **Composables (Unit Tests):** Direct function testing without mounting components
2. **Integration Tests:** Full app rendering with router and state management, testing complete user workflows
3. **Accessibility & Visual:** axe-core scanning and screenshot comparisons

## Vitest Browser Mode vs JSDOM

Browser mode uses real browser instances rather than simulating them. Performance data shows browser mode executing tests in **13.59 seconds vs JSDOM's 53.72 seconds**—4x faster despite higher setup overhead.

With browser mode, Testing Library becomes unnecessary. The built-in `page` object provides Playwright-like locators.

## Essential Patterns

- **Factories:** Encapsulate test data with sensible defaults
- **Page Objects:** Centralize DOM queries and user interactions per page

## Key Takeaways

- Start with critical user flows; test those thoroughly before expanding coverage
- Prioritize `getByRole()` queries to ensure accessibility
- Extract patterns incrementally as repetition emerges, not preemptively

## Notable Quote

> "When an AI writes code, tests become even more critical. They serve three purposes: catch bugs, enable refactoring, and document behavior."

## Related

When using AI coding tools like [[writing-a-good-claude-md|Claude Code]], tests become essential for validating generated code. See also [[12-factor-agents]] for principles on building reliable AI-assisted workflows.

