---
title: "The State of Vitest"
type: talk
url: "https://www.youtube.com/watch?v=AGmVjX_iilo"
conference: "ViteConf 2025"
tags:
  - testing
  - developer-experience
  - typescript
authors:
  - vladimir-sheremet
summary: "Vitest 3 standardized APIs and improved browser mode; Vitest 4 rewrites mocking, adds visual regression testing, Playwright traces, and VS Code debugging."
date: 2026-01-04
---

## Overview

Vladimir Sheremet presents Vitest's growth from 5.5M to 16.5M weekly downloads and walks through key features in Vitest 3 and 4. The talk covers API standardization, browser mode improvements, and developer experience enhancements.

## Key Arguments

### Standardized Reporter API Replaces Guesswork

Vitest 3 rewrote the reporter API from a convoluted `onTaskUpdate` hook into proper events. Previously, reporters received raw data and had to infer test states. Now there's a documented event cycle with public API contracts. Vitest 4 removes the old hooks entirely.

### Browser Mode Instances Share Dev Servers

A new "instances" concept lets multiple browser configurations share the same Vite dev server and cache. Running tests across Chrome, Firefox, and Safari no longer spawns separate servers—each reuses compiled code. Vitest 4 changes provider syntax to function imports, eliminating manual type references.

### Custom Locators Enable Framework-Specific Queries

The custom locators API (Vitest 3.2) lets you define your own query methods on page and locator objects. Return a locator string and get auto-retry behavior for free. Works across Playwright, WebDriver.io, and preview modes.

### Abort Signals Stop Long-Running Tests

When you cancel a test run, Vitest now exposes an abort signal you can pass to child processes or async operations. Pressing Ctrl+C no longer leaves orphan processes running.

### Annotations API Surfaces Test Metadata

Call `annotate()` to attach titles, descriptions, links, or file buffers to test results. The UI and HTML reporters inline these annotations; the default reporter shows them only on failures. Useful for linking tests to GitHub issues.

## Vitest 4 Changes

### Rewritten Spying and Mocking

Vitest dropped the tiny-spy package and rewrote spying internally. Classes now work as mock implementations directly. Auto-mocked instance methods properly isolate between instances while sharing prototype state—you can assert on prototype methods without instance access.

### Visual Regression Testing

Built-in screenshot comparison with a comprehensive CI setup guide. Vitest recommends against local use; the documentation explains the decision process and flake reduction strategies.

### Playwright Traces

Pass `browser.trace: true` to generate trace files for each test. View them in Playwright's trace viewer to debug CI failures with full timeline and page state snapshots.

### VS Code Debugging

Debug browser tests directly in VS Code using Chromium's DevTools Protocol. The `inspect` flag exposes a connection URL for any IDE or DevTools instance.

## Practical Takeaways

- Migrate reporters to the new event-based API before upgrading to Vitest 4
- Use browser instances to speed up cross-browser test suites
- Pass abort signals to child processes to avoid zombie processes on cancellation
- Annotate tests with issue links for better CI debugging
- Visual regression tests belong in CI, not local development

## References

Jessica Sachs' [[vitest-browser-mode]] talk dives deeper into browser mode specifics.
