---
title: "Organize your Composition API code"
type: youtube
url: "https://www.youtube.com/watch?v=iKaDFAxzJyw"
tags:
  - vue
  - composables
  - code-style
authors:
  - alexander-lichter
summary: "Group Composition API code by logic, not by type. Use inline composables to encapsulate related functionality without extracting to separate files."
date: 2026-01-02
---

## The Problem

Developers coming from Options API often organize Composition API code the same way—grouping refs together, computed properties together, watchers together. This defeats the purpose of the Composition API, which enables grouping by logic rather than by option type.

Comments like `// state`, `// computed`, `// watch` encourage this anti-pattern. Remove them.

## The Solution: Group by Logic

Move related code together. A ref, its computed properties, and its watchers should sit next to each other if they serve the same feature.

## Inline Composables

Create composable functions inside the same file when logic is only used in one component. No need to extract to a separate file.

```ts
// Inside your component file
function useMessage(input: Ref<string> | string) {
  const originalMessage = toRef(input)
  const isReversed = ref(false)

  const message = computed(() =>
    isReversed.value
      ? originalMessage.value.split('').reverse().join('')
      : originalMessage.value
  )

  function toggleReverse() {
    isReversed.value = !isReversed.value
  }

  return { message, toggleReverse }
}
```

This hides implementation details while keeping the top-level script clean and declarative.

## When to Extract

Extract to a separate file only when:
- Multiple components need the same logic
- The composable becomes complex enough to warrant its own tests

## Key Takeaways

- Group code by feature, not by Vue option type
- Inline composables organize single-component logic without file overhead
- Top-level code should read like a high-level summary
- Implementation details belong in composables

## Connections

Extends the reusability concepts in [[6-levels-of-reusability]] and aligns with the structural patterns in [[how-to-structure-vue-projects]]. See also [[mastering-vue-3-composables-style-guide]] for composable conventions.
