---
title: "Tidy First?"
type: book
url: "https://www.goodreads.com/book/show/171691901-tidy-first"
cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1688419801i/171691901.jpg"
tags:
  - software-design
  - refactoring
  - best-practices
authors:
  - kent-beck
summary: "A compact guide to code tidying—small, behavior-preserving changes that make code easier to understand and modify before making structural changes."
status: completed
dateCompleted: 2024
date: 2026-01-03
---

Kent Beck tackles the question every developer faces: should you clean up messy code before changing it, or just dive in? His answer is nuanced—tidy first, but only when it helps.

## Core Concept

Tidyings are small, low-risk refactorings that prepare code for change. They differ from full refactoring because they're quick, reversible, and focused on the immediate task. Think of them as clearing a workspace before building.

## Key Tidyings

Beck catalogs specific tidying moves:

- **Guard clauses** — Replace nested conditionals with early returns
- **Extract helper** — Pull repeated code into named functions
- **Normalize symmetries** — Make similar code look similar
- **Dead code removal** — Delete what's no longer used
- **Chunk statements** — Group related lines with blank lines

## When to Tidy

The book's central insight: tidying has costs and benefits that compound differently.

Tidy first when:
- The change will be easier to make
- You'll touch the same code again soon
- Understanding the code takes significant effort

Skip tidying when:
- You're under time pressure for a one-off fix
- The code won't be touched again
- The tidying is bigger than the actual change

## Economics of Software Design

Beck connects tidying to economic thinking. Code changes have time value—options created now may pay off later. Coupling increases the cost of change; cohesion reduces it. Tidying reduces coupling locally, making future changes cheaper.

## Related

- [[kent-beck]] — Author, creator of TDD and XP
