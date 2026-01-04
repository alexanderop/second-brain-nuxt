import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
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

  it('returns empty array for very short title (less than 3 chars)', async () => {
    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({ query: { slug: 'test', title: 'ab' } }))

    expect(result).toEqual([])
  })

  it('excludes self-references from mentions (section.id with leading slash)', async () => {
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

    // Section ID has leading slash - the note mentions its own title
    const searchSections = [
      {
        id: '/atomic-habits#intro',
        title: 'Introduction',
        titles: ['Introduction'],
        content: 'This book Atomic Habits teaches you how to build better habits.',
      },
    ]

    queryCollectionMock.setData(content)
    searchSectionsMock.mockResolvedValue(searchSections)

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    // Should NOT include self-reference
    expect(result).toEqual([])
  })

  it('excludes self-references from mentions (section.id without leading slash)', async () => {
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

    // Section ID WITHOUT leading slash - this was the bug case
    const searchSections = [
      {
        id: 'atomic-habits#intro',
        title: 'Introduction',
        titles: ['Introduction'],
        content: 'This book Atomic Habits teaches you how to build better habits.',
      },
    ]

    queryCollectionMock.setData(content)
    searchSectionsMock.mockResolvedValue(searchSections)

    const { default: handler } = await import('../../server/api/mentions.get')
    const result = await handler(createMockEvent({
      query: { slug: 'atomic-habits', title: 'Atomic Habits' },
    }))

    // Should NOT include self-reference even without leading slash
    expect(result).toEqual([])
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
})
