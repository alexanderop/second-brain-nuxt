---
title: "Vitest Browser Mode"
type: talk
url: "https://www.youtube.com/watch?v=VFYqwXPgJFw"
conference: "ViteConf 2025"
tags:
  - testing
  - vue
  - developer-experience
  - best-practices
authors:
  - jessica-sachs
summary: "Vitest browser mode runs component tests in real browsers instead of JSDOM, providing actual rendering confidence while maintaining Vitest's speed and developer experience."
date: 2026-01-04
---

## Overview

Jessica Sachs demonstrates Vitest browser mode, which executes component tests in real browsers using Playwright. The approach bridges the gap between fast headless testing and visual confidence, letting developers see exactly what they're shipping.

## Key Arguments

### Real Browser Testing Solves Confidence Problems

Most UI component tests run in JSDOM or HappyDOM—simulated environments that can't render CSS, handle complex events, or display visual output. Browser mode uses actual Chrome instances (via Playwright), giving developers visual feedback and catching issues that headless tests miss.

### Speed Remains Competitive

Sachs converted 2,400 Nuxt UI tests to browser mode in 16 hours. The full suite runs in 27 seconds on her MacBook, including 200 visual regression screenshots. A smaller Hacker News demo runs 54 tests in 2 seconds with full state management (Pinia, Vue Router, MSW mocks).

### Visual Regression Testing Changes the Game

For components like icon buttons with nested SVGs, taking screenshots eliminates fragile selector-based assertions. Vitest 4 adds screenshot diffing with production-ready handling for OS differences, Docker environments, and CI pipelines.

## Practical Takeaways

- Use `vitest-browser-vue` (or React/Svelte equivalents) for cleaner syntax than testing-library
- Browser mode parallelizes across 5 headless Chrome instances by default
- The `standalone` watch mode lets you run specific test files on save
- Works alongside existing Node-based tests in the same Vitest config
- Playwright installation is reused—no separate browser downloads in CI

## Notable Quotes

> "The majority of the tests we write for UI components are headless and that's unfortunate. It doesn't give us a lot of confidence."

> "I could do it correctly or I could just take a picture."
