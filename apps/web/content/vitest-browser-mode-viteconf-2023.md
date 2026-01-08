---
title: "Vitest Browser Mode"
type: talk
url: "https://www.youtube.com/watch?v=d5S7Dy0rpQo"
conference: "ViteConf 2023"
tags:
  - testing
  - developer-experience
  - best-practices
authors:
  - mohammad-bagher-abiyat
summary: "Vitest Browser Mode runs tests in real browsers instead of jsdom simulations, eliminating false positives from Node.js APIs leaking into the test environment."
date: 2026-01-04
---

## Overview

Mohammad Bagher Abiyat introduces Vitest Browser Mode, which spins up actual browsers for testing instead of relying on jsdom or happy-dom simulations. The approach catches environment mismatches that simulated DOMs miss entirely.

## Key Arguments

### Simulated DOMs Create False Confidence

Tools like jsdom and happy-dom implement browser APIs in Node.js, but they're approximations. Tests pass when they shouldn't—for example, the `process` object exists in jsdom tests even though real browsers don't have it. Testing browser apps in Node.js means testing in the wrong environment.

### Browser Mode Provides Accuracy

Vitest Browser Mode launches an actual browser (Chrome, Firefox, or WebKit via Playwright or WebdriverIO), runs tests there, and reports results back to the terminal. The `process` object correctly returns undefined. Window APIs behave exactly as users will experience them.

### Isolation Through Iframes

Each test file runs in its own iframe, providing context isolation and enabling concurrency. The team can run 100+ test files simultaneously without cross-contamination. A Browser UI feature renders the DOM state visually so developers see exactly what each test produces.

## Practical Takeaways

- Enable with `browser: { enabled: true, name: 'chrome' }` in vitest config
- Choose between `webdriverio` or `playwright` as the provider
- Set `headless: true` for CI environments
- Use the "none" provider to test in any browser including Arc or StackBlitz
- Browser UI shows live DOM state for each test file

## Notable Quotes

> "I actually believe we're testing browser applications right now in the wrong environment."

## References

See also [[vitest-browser-mode]] for Jessica Sachs' 2025 follow-up covering visual regression testing and production deployment patterns.
