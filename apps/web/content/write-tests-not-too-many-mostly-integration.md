---
title: "Write Tests. Not Too Many. Mostly Integration."
type: article
url: "https://kentcdodds.com/blog/write-tests"
tags:
  - testing
  - integration-testing
  - best-practices
authors:
  - kent-c-dodds
summary: "Prioritize integration tests over unit tests for maximum confidence with minimal maintenance burden—aim for ~70% coverage, not 100%."
date: 2026-01-02
---

Kent unpacks Guillermo Rauch's famous testing mantra, arguing against the traditional testing pyramid in favor of a "testing trophy" approach.

## The Three Parts

**Write Tests** — Automated tests save time during maintenance and catch bugs before users do. The upfront investment pays off quickly.

**Not Too Many** — Chasing 100% coverage creates diminishing returns. Beyond ~70%, you're often testing implementation details that make refactoring painful and provide false confidence.

**Mostly Integration** — Integration tests hit the sweet spot between confidence and cost. They verify components work together without the brittleness of E2E tests or the isolation limits of unit tests.

## The Testing Trophy

Rather than the traditional pyramid (many unit tests, fewer integration, even fewer E2E), Kent advocates for a trophy shape:

- Static analysis at the base (TypeScript, ESLint)
- Some unit tests for complex logic
- **Many integration tests** (the bulk)
- Few E2E tests for critical paths

## Key Insight

Reduce mocking. The more your tests resemble how your software is actually used, the more confidence they provide. Mock only what you must (network boundaries, time), not internal modules.

## Related

See [[vue3-testing-pyramid-vitest-browser-mode]] for a practical implementation of this philosophy with Vue 3 and Vitest.
