---
title: "12 Design Patterns in Vue"
type: article
url: "https://michaelnthiessen.com/12-design-patterns-vue"
tags:
  - vue
  - design-patterns
  - composables
  - architecture
  - best-practices
authors:
  - michael-thiessen
summary: "A curated collection of 12 Vue-specific design patterns addressing common problems every app encounters, from state management to component organization."
notes: ""
date: 2026-01-02
---

## Overview

A practical guide to 12 design patterns specifically for Vue development, addressing problems that basically every app has.

## The 12 Patterns

### 1. Data Store Pattern
Creates a global state singleton using composables. Expose selected state through `toRefs`, keep some state private, and provide methods to modify underlying values while maintaining encapsulation.

### 2. Thin Composables
Separates reactivity management from business logic—use pure functions for core logic with a minimal reactivity layer on top. Improves testability and reusability.

### 3. Humble Components
Focuses components on presentation and user input. Follow "Props down, events up" principles for clear data flow.

### 4. Extract Conditional
Simplifies templates with multiple branches by extracting each conditional path into separate components.

### 5. Extract Composable
Moves component logic into composables even for single-use cases. Facilitates adding related methods like undo/redo while keeping logic separate from UI.

### 6. List Component Pattern
Abstracts `v-for` loop logic into dedicated child components, reducing parent complexity.

### 7. Preserve Object Pattern
Passes entire objects as props instead of individual properties. Simplifies components and future-proofs them, though creates structural dependencies.

### 8. Controller Components
Bridges UI (Humble Components) and business logic (composables). Manages state and interactions while orchestrating application behavior.

### 9. Strategy Pattern
Uses dynamic component switching via `<component :is>` based on runtime conditions for complex conditional logic.

### 10. Hidden Components
Splits complex components into smaller ones when different property sets are used exclusively together.

### 11. Insider Trading
Simplifies overly coupled parent-child relationships by inlining child components into parents when appropriate.

### 12. Long Components
Components become problematic "when it becomes too hard to understand." Encourages self-documenting, clearly named components.

## Connections

Complements [[mastering-vue-3-composables-style-guide]] with patterns for structuring components around composables.
