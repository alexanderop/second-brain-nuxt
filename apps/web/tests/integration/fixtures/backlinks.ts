/**
 * Backlinks response fixtures for integration tests
 *
 * Note: These fixtures match the BacklinksIndex type from server/utils/backlinks.ts
 */

export interface BacklinkItemFixture {
  slug: string
  title: string
  type: string
}

export interface BacklinksIndexFixture {
  [targetSlug: string]: BacklinkItemFixture[]
}

export const emptyBacklinks: BacklinksIndexFixture = {}

export const simpleBacklinks: BacklinksIndexFixture = {
  'note-b': [
    { slug: 'note-a', title: 'Note A', type: 'note' },
  ],
}

export const bidirectionalBacklinks: BacklinksIndexFixture = {
  'deep-work': [
    { slug: 'atomic-habits', title: 'Atomic Habits', type: 'book' },
  ],
  'atomic-habits': [
    { slug: 'deep-work', title: 'Deep Work', type: 'book' },
  ],
}

export const hubBacklinks: BacklinksIndexFixture = {
  'productivity-hub': [
    { slug: 'atomic-habits', title: 'Atomic Habits', type: 'book' },
    { slug: 'deep-work', title: 'Deep Work', type: 'book' },
    { slug: 'getting-things-done', title: 'Getting Things Done', type: 'book' },
  ],
}

export function createBacklinksResponse(
  entries: Array<{ target: string, sources: BacklinkItemFixture[] }>,
): BacklinksIndexFixture {
  const result: BacklinksIndexFixture = {}
  for (const entry of entries) {
    result[entry.target] = entry.sources
  }
  return result
}
