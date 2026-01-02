---
title: "The 6 Levels of Reusability"
type: article
url: "https://michaelnthiessen.com/6-levels-of-reusability/"
tags:
  - vue
  - components
  - software-design
authors:
  - michael-thiessen
summary: "A progressive framework for Vue component reusability, from basic templating to sophisticated nested composition."
date: 2026-01-02
---

## The Six Levels

**Level 1 — Templating**: Wrap code in a component instead of copy-pasting. Eliminates redundancy.

**Level 2 — Configuration**: Use props to create variations without new components.

**Level 3 — Adaptability**: Slots let parent components pass markup, enabling unforeseen use cases.

**Level 4 — Inversion**: Scoped slots pass rendering instructions rather than complete markup. The child provides data; the parent decides presentation.

**Level 5 — Extension**: Multiple named slots create extension points throughout the component.

**Level 6 — Nesting**: Layer components with increasing specificity. Like biological taxonomy: Animal → Mammal → Dog → Poodle.

## Key Insight

Each level trades simplicity for flexibility. Start at Level 1; move up only when requirements demand it. Over-engineering hurts maintainability more than under-engineering.

## Connections

Builds on patterns from [[12-design-patterns-in-vue]]. The slot techniques connect to [[13-vue-composables-tips]] for state reuse.
