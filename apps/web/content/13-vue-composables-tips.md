---
title: "13 Vue Composables Tips That Make Your Code Better"
type: article
url: "https://michaelnthiessen.com/13-vue-composables-tips"
tags:
  - vue
  - composables
  - design-patterns
  - best-practices
authors:
  - michael-thiessen
summary: "Practical patterns for writing maintainable Vue composables, covering state management, reactivity handling, and code organization."
notes: ""
date: 2026-01-02
---

## The 13 Tips

### State Management
1. **Avoid prop drilling** — Replace passing props through multiple components with shared data stores
2. **Share data between unrelated components** — Let sibling or cousin components access data through composable stores
3. **Control state updates** — Expose read-only state alongside methods that define allowed mutations

### Code Organization
4. **Break up large components** — Group related state and logic into inline composables
5. **Separate business logic from reactivity** — Put complex rules in pure functions; composables wrap them with reactivity
6. **Separate logic paths** — Split mutually exclusive logic into dedicated composables

### API Design
7. **Handle sync and async together** — Combine both behaviors in one function (like Nuxt's `useAsyncData`)
8. **Use options objects** — Replace long parameter lists with named options
9. **Provide defaults** — Destructure options with safe defaults to avoid undefined errors
10. **Return flexible values** — Return a single ref for simple cases, an expanded object for complex ones

### Reactivity Patterns
11. **Normalize inputs** — Use `ref()` to handle both reactive and raw values uniformly
12. **Unwrap refs cleanly** — Use `toValue()` instead of repeated `isRef()` checks

### Migration
13. **Migrate incrementally** — Convert Options API components to script setup one at a time

## Connections

Expands on patterns from [[12-design-patterns-in-vue]] by the same author. Complements the style guide in [[mastering-vue-3-composables-style-guide]] with additional practical tips.
