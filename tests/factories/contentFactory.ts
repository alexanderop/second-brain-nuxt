/**
 * Content factories for test data generation
 *
 * Factories provide type-safe, customizable test data that is more
 * maintainable than static fixtures. Tests only need to specify
 * the properties relevant to their scenario.
 *
 * Usage:
 * ```typescript
 * import { createContentItem, createLinkedContent } from '../../factories/contentFactory'
 *
 * const book = createContentItem({ type: 'book', title: 'Atomic Habits' })
 * const linkedNote = createLinkedContent('My Note', 'atomic-habits')
 * ```
 */
import type { ContentFixture } from '../integration/fixtures/content'

let counter = 0

/**
 * Reset the factory counter between test files if needed
 */
export function resetContentFactory(): void {
  counter = 0
}

/**
 * Create a content item with sensible defaults
 * Override only the properties relevant to your test
 */
export function createContentItem(overrides: Partial<ContentFixture> = {}): ContentFixture {
  counter++
  const stem = overrides.stem ?? `test-note-${counter}`

  return {
    path: `/${stem}`,
    stem,
    title: overrides.title ?? `Test Note ${counter}`,
    type: overrides.type ?? 'note',
    tags: overrides.tags ?? [],
    summary: overrides.summary ?? 'A test note for testing purposes',
    body: overrides.body ?? { type: 'minimark', value: [] },
    ...overrides,
  }
}

/**
 * Create a content item that links to another item
 * Useful for testing backlinks and graph connections
 */
export function createLinkedContent(
  sourceTitle: string,
  targetStem: string,
  overrides: Partial<ContentFixture> = {},
): ContentFixture {
  return createContentItem({
    title: sourceTitle,
    body: {
      type: 'minimark',
      value: [
        ['p', {}, 'Text with ', ['a', { href: `/${targetStem}` }, targetStem]],
      ],
    },
    ...overrides,
  })
}

/**
 * Create multiple content items at once
 */
export function createContentItems(count: number, overrides: Partial<ContentFixture> = {}): ContentFixture[] {
  return Array.from({ length: count }, () => createContentItem(overrides))
}

/**
 * Create a book content item
 */
export function createBook(overrides: Partial<ContentFixture> = {}): ContentFixture {
  return createContentItem({
    type: 'book',
    tags: ['reading'],
    ...overrides,
  })
}

/**
 * Create an article content item
 */
export function createArticle(overrides: Partial<ContentFixture> = {}): ContentFixture {
  return createContentItem({
    type: 'article',
    tags: ['articles'],
    ...overrides,
  })
}

/**
 * Create a podcast content item
 */
export function createPodcast(overrides: Partial<ContentFixture> = {}): ContentFixture {
  return createContentItem({
    type: 'podcast',
    tags: ['podcasts'],
    ...overrides,
  })
}
