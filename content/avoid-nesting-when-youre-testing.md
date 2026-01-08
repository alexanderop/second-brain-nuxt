---
title: "Avoid Nesting When You're Testing"
type: article
url: "https://kentcdodds.com/blog/avoid-nesting-when-youre-testing"
tags:
  - testing
  - javascript
  - code-quality
  - best-practices
authors:
  - kent-c-dodds
summary: "Nested describe blocks with beforeEach hooks create cognitive burden by requiring developers to track mutable state across scope levels—prefer inline setup or factory functions instead."
date: 2019-07-29
---

## Summary

Kent C. Dodds argues against using nested `describe` blocks with `beforeEach` hooks for code reuse in tests. The pattern creates cognitive overhead: developers must mentally track variable assignments across multiple scope levels. "Where is `handleSubmit` coming from and what's its value?" becomes a frustrating question when variables are assigned in outer hooks and reassigned in nested ones.

## Key Concepts

- **Over-abstraction harms tests**: Utility functions like `changeUsernameInput()` add indirection without proportional benefits for simple scenarios
- **Mutable state breeds confusion**: Variable reassignments across nested scopes reduce cognitive capacity for actual test logic
- **Duplication beats wrong abstraction**: Explicit, self-contained tests are more maintainable than DRY tests with hidden state

## Code Snippets

### The Problem: Nested State

Variables assigned in outer `beforeEach` blocks become difficult to trace.

```javascript
describe('User Form', () => {
  let handleSubmit
  beforeEach(() => {
    handleSubmit = jest.fn()
  })

  describe('when submitted', () => {
    beforeEach(() => {
      // Where did handleSubmit come from? What's its current value?
    })
  })
})
```

### The Solution: Setup Functions

Return objects containing test utilities through composition.

```javascript
function setupSuccessCase() {
  const handleSubmit = jest.fn()
  const utils = render(<Form onSubmit={handleSubmit} />)
  // ... perform actions
  return { ...utils, handleSubmit }
}

test('submits form with valid data', () => {
  const { handleSubmit } = setupSuccessCase()
  expect(handleSubmit).toHaveBeenCalled()
})
```

## When Hooks Are Appropriate

`beforeAll`/`afterAll` have valid uses:
- Server startup and shutdown
- Mocking `console.error` across test suites

The key: pair setup with cleanup, don't use hooks as code-reuse mechanisms.

## Connections

No directly related notes yet. This article establishes foundational testing philosophy.
