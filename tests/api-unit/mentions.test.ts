import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fixtures,
  searchSectionFixtures,
  createQueryCollectionMock,
  createSearchSectionsMock,
  setupGlobalMocks,
  createMockEvent,
} from './setup'

// Setup mocks before importing handler
const queryCollectionMock = createQueryCollectionMock()
const searchSectionsMock = createSearchSectionsMock()

vi.mock('@nuxt/content/server', () => ({
  queryCollection: queryCollectionMock.mock,
  queryCollectionSearchSections: searchSectionsMock,
}))

setupGlobalMocks()

describe('/api/mentions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    queryCollectionMock.setData(fixtures.empty)
    searchSectionsMock.mockResolvedValue(searchSectionFixtures.empty)
  })

  it('returns empty array when no slug provided', async () => {
    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({ query: {} }))

    expect(result).toEqual([])
  })

  it('returns empty array when no title provided', async () => {
    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({ query: { slug: 'test' } }))

    expect(result).toEqual([])
  })

  it('returns empty array for very short title (< 3 chars)', async () => {
    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({ query: { slug: 'test', title: 'ab' } }))

    expect(result).toEqual([])
  })

  it('finds unlinked mentions in content', async () => {
    // Setup content without explicit links
    const content = [
      {
        path: '/article-one',
        stem: 'article-one',
        title: 'Article One',
        type: 'article',
        tags: [],
        body: { type: 'minimark', value: [] }, // No links
      },
      {
        path: '/article-three',
        stem: 'article-three',
        title: 'Article Three',
        type: 'article',
        tags: [],
        body: { type: 'minimark', value: [] }, // No links
      },
      {
        path: '/atomic-habits',
        stem: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(content)
    searchSectionsMock.mockResolvedValue(searchSectionFixtures.withMentions)

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    expect(result).toHaveLength(2) // article-one and article-three mention it
    expect(result[0]).toMatchObject({
      slug: 'article-one',
      title: 'Article One',
      type: 'article',
    })
  })

  it('excludes self-references from mentions', async () => {
    const content = [
      {
        path: '/atomic-habits',
        stem: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(content)

    // Search section for atomic-habits itself mentioning its own title
    const selfRefSections = [
      {
        id: '/atomic-habits#intro',
        title: 'Intro',
        titles: ['Intro'],
        content: 'This book about Atomic Habits explains habits.',
      },
    ]
    searchSectionsMock.mockResolvedValue(selfRefSections)

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    expect(result).toHaveLength(0) // Self-reference excluded
  })

  it('excludes notes that already have explicit links', async () => {
    // article-one explicitly links to atomic-habits
    const content = [
      {
        path: '/article-one',
        stem: 'article-one',
        title: 'Article One',
        type: 'article',
        tags: [],
        body: {
          type: 'minimark',
          value: [['a', { href: '/atomic-habits' }, 'Link']],
        },
      },
      {
        path: '/atomic-habits',
        stem: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(content)
    searchSectionsMock.mockResolvedValue(searchSectionFixtures.withMentions)

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    // article-one should be excluded because it has an explicit link
    const slugs = result.map((m: { slug: string }) => m.slug)
    expect(slugs).not.toContain('article-one')
  })

  it('includes snippet and highlighted snippet in results', async () => {
    const content = [
      {
        path: '/article-one',
        stem: 'article-one',
        title: 'Article One',
        type: 'article',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(content)
    searchSectionsMock.mockResolvedValue([
      {
        id: '/article-one#section',
        title: 'Section',
        titles: ['Section'],
        content: 'This discusses Atomic Habits and how to build better routines.',
      },
    ])

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    expect(result).toHaveLength(1)
    expect(result[0].snippet).toContain('Atomic Habits')
    expect(result[0].highlightedSnippet).toContain('<mark')
    expect(result[0].highlightedSnippet).toContain('Atomic Habits')
  })

  it('matches case-insensitively', async () => {
    const content = [
      {
        path: '/article-one',
        stem: 'article-one',
        title: 'Article One',
        type: 'article',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(content)
    searchSectionsMock.mockResolvedValue([
      {
        id: '/article-one#section',
        title: 'Section',
        titles: ['Section'],
        content: 'This discusses atomic habits in lowercase.',
      },
    ])

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    expect(result).toHaveLength(1)
  })

  it('handles errors gracefully', async () => {
    queryCollectionMock.mock.mockImplementationOnce(() => {
      throw new Error('Database error')
    })

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'test', title: 'Test Title' },
    }))

    expect(result).toEqual([])
  })

  it('returns only first mention per document', async () => {
    const content = [
      {
        path: '/article-one',
        stem: 'article-one',
        title: 'Article One',
        type: 'article',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(content)

    // Multiple sections from same document mentioning the term
    const multipleSections = [
      {
        id: '/article-one#intro',
        title: 'Intro',
        titles: ['Intro'],
        content: 'First mention of Atomic Habits here.',
      },
      {
        id: '/article-one#conclusion',
        title: 'Conclusion',
        titles: ['Conclusion'],
        content: 'Another mention of Atomic Habits here.',
      },
    ]
    searchSectionsMock.mockResolvedValue(multipleSections)

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    // Should only have one mention from article-one
    expect(result).toHaveLength(1)
  })
})
