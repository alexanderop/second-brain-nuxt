---
title: "Implementing Fractional Indexing"
type: article
url: "https://observablehq.com/@dgreensp/implementing-fractional-indexing"
tags:
  - local-first
  - architecture
  - software-design
authors:
  - david-greenspan
summary: "A technique for maintaining ordered sequences in collaborative systems using string-based keys that allow arbitrary insertions without renumbering."
date: 2026-01-04
---

## Summary

Fractional indexing solves ordering in real-time collaborative systems. Rather than numeric positions (1, 2, 3), it assigns string-based keys between 0 and 1. New items slot between existing ones without affecting other positions—critical for conflict-free replication.

## Key Concepts

**String-based fractions** overcome JavaScript's floating-point precision limits. Instead of `0.5`, the system uses `'5'`. Keys compare lexicographically, making database sorting trivial.

**The midpoint function** generates keys between any two existing keys by:

- Finding common prefixes and recursing on differing portions
- Locating digits between consecutive first digits
- Handling edge cases when digits are adjacent

**Integer encoding** keeps keys short through variable-length prefixes. Letters denote magnitude: `a0`–`a9` for small integers, `b00`–`b99` for medium ranges, extending with uppercase/lowercase for larger values.

## Code Snippets

### Generating a key between two existing keys

The core algorithm handles START/END sentinels and optimizes for prepending, appending, and insertion.

```javascript
function generateKeyBetween(a, b) {
  // a < b lexicographically, or a/b can be null for start/end
  if (a === null && b === null) return 'a0'
  if (a === null) return decrementInteger(b)
  if (b === null) return incrementInteger(a)
  // Find midpoint between a and b
  return midpoint(a, b)
}
```

### Bulk insertion

Inserting N items uses recursive balancing to minimize key length growth.

```javascript
function generateNKeysBetween(a, b, n) {
  if (n === 0) return []
  if (n === 1) return [generateKeyBetween(a, b)]
  const mid = generateKeyBetween(a, b)
  const left = generateNKeysBetween(a, mid, Math.floor(n / 2))
  const right = generateNKeysBetween(mid, b, Math.ceil(n / 2) - 1)
  return [...left, mid, ...right]
}
```

## Why It Matters

Traditional array indices break under concurrent edits—inserting at position 3 conflicts when another user does the same. Fractional indexing sidesteps this by generating unique, ordered keys that never collide. CRDTs like Figma's multiplayer system rely on this approach.
