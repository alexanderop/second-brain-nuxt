/**
 * Raw content response fixtures for integration tests
 *
 * Note: These fixtures match the response shape from server/api/raw-content/[slug].get.ts
 */

export interface RawContentFixture {
  raw: string
}

export const simpleRawContent: RawContentFixture = {
  raw: `---
title: Atomic Habits
type: book
tags: [productivity, habits]
---

# Atomic Habits

Small changes, remarkable results.

Links to [[deep-work]] and [[thinking-fast-and-slow]].
`,
}

export const minimalRawContent: RawContentFixture = {
  raw: `---
title: Simple Note
type: note
---

Just a simple note.
`,
}

export function createRawContentResponse(markdown: string): RawContentFixture {
  return { raw: markdown }
}
