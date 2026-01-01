import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fixtures,
  createQueryCollectionMock,
  setupGlobalMocks,
  createMockEvent,
} from './setup'

// Setup mocks before importing handler
const queryCollectionMock = createQueryCollectionMock()

vi.mock('@nuxt/content/server', () => ({
  queryCollection: queryCollectionMock.mock,
}))

setupGlobalMocks()

describe('/api/backlinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns empty object for no content', async () => {
    queryCollectionMock.setData(fixtures.empty)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual({})
  })

  it('returns empty object for content with no links', async () => {
    queryCollectionMock.setData(fixtures.simpleNote)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual({})
  })

  it('builds backlinks index from linked content', async () => {
    queryCollectionMock.setData(fixtures.linkedNotes)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    // note-a links to note-b, so note-b should have note-a as a backlink
    expect(result['note-b']).toBeDefined()
    expect(result['note-b']).toHaveLength(1)
    expect(result['note-b'][0]).toMatchObject({
      slug: 'note-a',
      title: 'Note A',
      type: 'note',
    })
  })

  it('handles bidirectional links', async () => {
    queryCollectionMock.setData(fixtures.multipleLinks)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    // atomic-habits links to deep-work and thinking-fast-and-slow
    // deep-work links to atomic-habits
    expect(result['deep-work']).toHaveLength(1) // from atomic-habits
    expect(result['thinking-fast-and-slow']).toHaveLength(1) // from atomic-habits
    expect(result['atomic-habits']).toHaveLength(1) // from deep-work

    expect(result['deep-work'][0].slug).toBe('atomic-habits')
    expect(result['atomic-habits'][0].slug).toBe('deep-work')
  })

  it('does not include self-references in backlinks', async () => {
    const contentWithSelfLink = [
      {
        path: '/note-a',
        stem: 'note-a',
        title: 'Note A',
        type: 'note',
        tags: [],
        body: {
          type: 'minimark',
          value: [
            ['p', {}, ['a', { href: '/note-a' }, 'Self link']],
          ],
        },
      },
    ]
    queryCollectionMock.setData(contentWithSelfLink)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    // Self-links should not create backlinks
    expect(result['note-a']).toBeUndefined()
  })

  it('includes correct metadata in backlink items', async () => {
    queryCollectionMock.setData(fixtures.multipleLinks)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    const deepWorkBacklinks = result['deep-work']
    expect(deepWorkBacklinks[0]).toMatchObject({
      slug: 'atomic-habits',
      title: 'Atomic Habits',
      type: 'book',
    })
  })

  it('handles multiple backlinks to the same target', async () => {
    const multipleSourcesContent = [
      {
        path: '/source-a',
        stem: 'source-a',
        title: 'Source A',
        type: 'note',
        tags: [],
        body: {
          type: 'minimark',
          value: [['a', { href: '/target' }, 'Link']],
        },
      },
      {
        path: '/source-b',
        stem: 'source-b',
        title: 'Source B',
        type: 'article',
        tags: [],
        body: {
          type: 'minimark',
          value: [['a', { href: '/target' }, 'Link']],
        },
      },
      {
        path: '/target',
        stem: 'target',
        title: 'Target',
        type: 'note',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(multipleSourcesContent)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    expect(result['target']).toHaveLength(2)
    const slugs = result['target'].map((b: { slug: string }) => b.slug)
    expect(slugs).toContain('source-a')
    expect(slugs).toContain('source-b')
  })

  it('handles errors gracefully', async () => {
    queryCollectionMock.mock.mockImplementationOnce(() => {
      throw new Error('Database error')
    })

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual({})
  })

  it('deduplicates multiple links to the same target from one source', async () => {
    const contentWithDuplicateLinks = [
      {
        path: '/source',
        stem: 'source',
        title: 'Source',
        type: 'note',
        tags: [],
        body: {
          type: 'minimark',
          value: [
            ['p', {}, ['a', { href: '/target' }, 'Link 1'], ' and ', ['a', { href: '/target' }, 'Link 2']],
          ],
        },
      },
      {
        path: '/target',
        stem: 'target',
        title: 'Target',
        type: 'note',
        tags: [],
        body: { type: 'minimark', value: [] },
      },
    ]
    queryCollectionMock.setData(contentWithDuplicateLinks)

    const { default: handler } = await import('../../server/api/backlinks.get')
    const result = await handler(createMockEvent())

    // Should only have one backlink entry, not two
    expect(result['target']).toHaveLength(1)
  })
})
