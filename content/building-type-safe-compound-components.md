---
title: "Building Type-Safe Compound Components"
type: article
url: "https://tkdodo.eu/blog/building-type-safe-compound-components"
tags:
  - typescript
  - react
  - design-patterns
  - developer-experience
authors:
  - tkdodo
summary: "Compound components work best for flexible layouts, not dynamic data or fixed structures. A factory function pattern solves the type safety problem without sacrificing flexibility."
date: 2026-02-01
---

## Summary

Part 3 of TkDodo's "Designing Design Systems" series challenges the assumption that compound components fit every use case. He identifies two anti-patterns—fixed layout requirements and dynamic content—where simpler alternatives work better.

## When NOT to Use Compound Components

**Fixed layouts**: When component structure must stay consistent (like modals with header/body/footer in a specific order), slots outperform compound components. Compound patterns invite reordering that breaks the design.

**Dynamic content**: Components rendering lists from APIs suffer with compound patterns. Mapping over data to produce `<RadioGroupItem>` elements creates awkward code that a simple props-based API handles more cleanly.

## Good Candidates

RadioGroup, TabBar, and ButtonGroup benefit from compound patterns because they support flexible child layouts with mostly static content. The explicit parent-child relationships in markup match the mental model.

## The Factory Pattern Solution

The core innovation: expose a `createRadioGroup<T>()` factory instead of raw components. The factory returns statically-typed instances that enforce type consistency between parent and children.

```typescript
// Factory returns typed components
const Theme = createRadioGroup<ThemeValue>()

// Type safety cascades automatically
<Theme.Root value={theme} onValueChange={setTheme}>
  <Theme.Item value="system">🤖</Theme.Item>
  <Theme.Item value="light">☀️</Theme.Item>
  <Theme.Item value="dark">🌙</Theme.Item>
</Theme.Root>
```

This approach ties parent and child types together at creation time. No manual type annotations on each child, no accidental mismatches.

## Connections

- [[composition-is-all-you-need]] - Fernando Rojo makes the case FOR compound components to escape boolean prop sprawl. TkDodo adds nuance: compound patterns excel for flexible composition but fail for fixed layouts and dynamic data.
- [[6-levels-of-reusability]] - Michael Thiessen's Vue framework for choosing between props, slots, and composition parallels TkDodo's React guidance. Both argue against reaching for maximum flexibility when simpler patterns suffice.
