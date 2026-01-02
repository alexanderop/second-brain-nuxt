---
title: "The Testing Pyramid is Dead"
type: article
url: "https://michaelnthiessen.com/testing-pyramid-is-dead"
tags:
  - testing
  - vue
  - frontend
authors:
  - michael-thiessen
summary: "Mike Cohn's 2009 testing pyramid no longer fits modern web development—teams should design their own testing strategy based on tooling, architecture, and risk tolerance."
date: 2026-01-02
---

## Core Argument

The testing pyramid was designed for C++ and Java in 2009. Modern JavaScript tooling has changed the equation:

1. **E2E tests got faster and more reliable.** Playwright and Cypress use WebDriver Protocol and Chrome DevTools Protocol with built-in waiting and retries. The "slow, flaky e2e" assumption no longer holds.

2. **TypeScript reduces unit test needs.** Static typing catches bugs that once required defensive unit tests. Kent C. Dodds observed this shift years ago.

3. **No universal testing strategy exists.** Unlike version control (where Git won), testing approaches should fit the project—like city planning, not one-size-fits-all.

## The Alternative

Draw your own testing shape. Consider:
- Team size and structure
- Architecture (monolith vs. microservices)
- Risk tolerance
- Project-specific constraints

## Connections

Builds on [[write-tests-not-too-many-mostly-integration]]—Dodds' "testing trophy" was an early challenge to pyramid orthodoxy. See also [[vue3-testing-pyramid-vitest-browser-mode]] for a practical Vue testing setup using modern tooling.
