---
title: "Refactoring: Improving the Design of Existing Code"
type: book
url: "https://www.goodreads.com/book/show/44936.Refactoring"
cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1386925632i/44936.jpg"
tags:
  - refactoring
  - software-design
  - best-practices
  - code-quality
  - design-patterns
authors:
  - martin-fowler
summary: "The definitive guide to improving code structure without changing behavior. Fowler catalogs refactoring techniques with clear examples, making messy code maintainable."
date: 2026-01-03
status: completed
dateCompleted: 2025
---

The foundational text on restructuring existing code. [[martin-fowler]] defines refactoring as changing code structure without altering external behavior, then provides a comprehensive catalog of techniques to do exactly that.

## Core Philosophy

Bad code accumulates. Features get added, requirements shift, and clean designs decay into tangled messes. Refactoring offers a systematic way out: small, behavior-preserving transformations that gradually improve structure.

The key insight: you don't need a grand rewrite. Incremental improvements compound. Each refactoring makes the next easier.

## The Catalog

Fowler organizes refactorings by what they improve:

- **Composing Methods** - Extract Method, Inline Method, Replace Temp with Query
- **Moving Features** - Move Method, Move Field, Extract Class
- **Organizing Data** - Replace Data Value with Object, Change Value to Reference
- **Simplifying Conditionals** - Decompose Conditional, Replace Conditional with Polymorphism
- **Making Method Calls Simpler** - Rename Method, Add Parameter, Replace Parameter with Method

Each technique follows the same format: motivation, mechanics, and example. The mechanics section gives step-by-step instructions safe enough to follow mechanically.

## Code Smells

Before refactoring, you need to spot problems. Fowler catalogs "code smells" - symptoms that suggest deeper issues:

- **Long Method** - methods that try to do too much
- **Large Class** - classes with too many responsibilities
- **Feature Envy** - methods that use another class's data more than their own
- **Data Clumps** - groups of data that travel together
- **Shotgun Surgery** - one change requires edits across many classes

Smells guide you toward which refactorings to apply.

## Connection to Tidy First

Kent Beck's [[tidy-first]] builds on this foundation. Where Fowler provides the comprehensive catalog, Beck asks: when should you refactor versus ship? Both books share the same core belief - clean code pays dividends.
