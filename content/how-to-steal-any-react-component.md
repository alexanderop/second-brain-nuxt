---
title: "How to Steal Any React Component"
type: article
url: "https://fant.io/react/"
tags:
  - react
  - reverse-engineering
  - llm
authors:
  - david-fant
summary: "You can extract and reconstruct any React component from a production website by leveraging React Fiber's internal tree structure combined with LLMs."
date: 2026-01-17
---

## Summary

React Fiber—React's internal reconciliation algorithm—exposes the component tree of any production React website through browser DevTools. By accessing the fiber nodes attached to DOM elements, you can extract component names, props, state, and their hierarchical relationships without needing source code.

The technique combines this extraction with LLMs to reconstruct working component code. The fiber tree gives you the structure and data; the LLM generates the implementation.

## Key Points

- React Fiber attaches internal data structures to DOM elements that reveal the component tree
- Production websites still expose this fiber information even when source maps are stripped
- Component props, state, and hierarchy are all accessible through fiber node inspection
- LLMs can reconstruct functional code from the extracted structure and styling information

## Code Snippets

### Accessing React Fiber

Every React DOM element has a property starting with `__reactFiber` that gives access to the fiber node.

```javascript
const element = document.querySelector('.target-component')
const fiberKey = Object.keys(element).find(key => key.startsWith('__reactFiber'))
const fiber = element[fiberKey]

// fiber.type gives the component function/class
// fiber.memoizedProps gives the props
// fiber.memoizedState gives the state
```

### Walking the Component Tree

You can traverse parent and child relationships through fiber properties.

```javascript
function walkFiberTree(fiber, depth = 0) {
  const name = fiber.type?.displayName || fiber.type?.name || 'Anonymous'
  console.log('  '.repeat(depth) + name)

  let child = fiber.child
  while (child) {
    walkFiberTree(child, depth + 1)
    child = child.sibling
  }
}
```

✓ No diagram needed: Abstract technique without process flow or framework structure
