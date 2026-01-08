---
title: "Mastering Functional Programming with TypeScript"
type: book
url: "https://www.goodreads.com/book/show/209147399-mastering-functional-programming-with-typescript"
cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1708899543i/209147399.jpg"
tags:
  - typescript
  - functional-programming
  - fp-ts
  - design-patterns
authors:
  - art-deineka
summary: "A practical guide to functional programming in TypeScript using the fp-ts library, covering core concepts like referential transparency, currying, functors, and monads."
rating: 5
readingStatus: finished
finishedReading: 2024-12-31
date: 2024-12-31
---

## Core Framework

Functional programming treats functions as mappings between sets. Pure functions have **referential transparency**: when a function's result is known for given parameters, you can replace the call with the result. Side effects break this property.

Unlike object-oriented programming where methods attach to data, functional programming keeps code and data separate. Both are first-class citizens.

## Key Concepts

### Currying and Composition

Currying transforms multi-argument functions into chains of single-argument functions. Named after mathematician Haskell Curry (whose first name inspired the Haskell language).

- **pipe**: Takes data as the first parameter, then chains functions that transform it
- **flow**: Like pipe without the initial data, returning a composed function

Both are higher-order functions.

### Algebraic Data Types

- **Functor**: Any container holding values that exposes a `map` function to transform those values while preserving the container type
- **Monoid**: Knows how to `concat` and has an empty element
- **Monad**: Unlocks Do notation, allowing side computations alongside the main computation

Spreading objects into new ones replaces inheritance. You can compose from multiple sources, not just a single ancestor chain.

### Side Effects and IO

A side effect is any change to the execution environment peripheral to the main computation. Marking functions as IO doesn't remove side effects; it lets you compose effectful computations as if they were pure.

### fp-ts Approach

Native JavaScript favors method cascading: `arr.map(func).reduce(func)`. fp-ts prefers piped invocations. Pipe detaches logic from the subject.

## Practical Guidance

Avoid explicit `for`/`while` loops or abrupt terminations like throwing exceptions. Reaching for these signals a less-optimal path; step back and reconsider the solution.
