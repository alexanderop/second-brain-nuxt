import { vi } from 'vitest'

// Content fixtures for testing
export const fixtures = {
  empty: [],

  simpleNote: [
    {
      path: '/note-a',
      stem: 'note-a',
      title: 'Note A',
      type: 'note',
      tags: [],
      summary: 'A simple note',
      body: { type: 'minimark', value: [] },
    },
  ],

  linkedNotes: [
    {
      path: '/note-a',
      stem: 'note-a',
      title: 'Note A',
      type: 'note',
      tags: ['tag1'],
      summary: 'First note',
      body: {
        type: 'minimark',
        value: [
          ['p', {}, 'Text with ', ['a', { href: '/note-b' }, 'link to B']],
        ],
      },
    },
    {
      path: '/note-b',
      stem: 'note-b',
      title: 'Note B',
      type: 'article',
      tags: ['tag2'],
      summary: 'Second note',
      body: { type: 'minimark', value: [] },
    },
  ],

  multipleLinks: [
    {
      path: '/atomic-habits',
      stem: 'atomic-habits',
      title: 'Atomic Habits',
      type: 'book',
      tags: ['productivity', 'habits'],
      summary: 'Build better habits',
      body: {
        type: 'minimark',
        value: [
          ['p', {}, 'Links to ', ['a', { href: '/deep-work' }, 'Deep Work'], ' and ', ['a', { href: '/thinking-fast-and-slow' }, 'Thinking Fast']],
        ],
      },
    },
    {
      path: '/deep-work',
      stem: 'deep-work',
      title: 'Deep Work',
      type: 'book',
      tags: ['productivity', 'focus'],
      summary: 'Focus without distraction',
      body: {
        type: 'minimark',
        value: [
          ['p', {}, 'References ', ['a', { href: '/atomic-habits' }, 'Atomic Habits']],
        ],
      },
    },
    {
      path: '/thinking-fast-and-slow',
      stem: 'thinking-fast-and-slow',
      title: 'Thinking Fast and Slow',
      type: 'book',
      tags: ['psychology'],
      summary: 'Two systems of thinking',
      body: { type: 'minimark', value: [] },
    },
  ],
}

// Search sections for mentions testing
export const searchSectionFixtures = {
  empty: [],

  withMentions: [
    {
      id: '/article-one#intro',
      title: 'Introduction',
      titles: ['Introduction'],
      content: 'This article discusses Atomic Habits and how to build better routines.',
    },
    {
      id: '/article-two#main',
      title: 'Main Content',
      titles: ['Main Content'],
      content: 'Some unrelated content here without any mentions.',
    },
    {
      id: '/article-three#section',
      title: 'Section',
      titles: ['Section'],
      content: 'Another reference to Atomic Habits in this section.',
    },
  ],
}

// Mock factory for queryCollection
export function createQueryCollectionMock(data: unknown[] = fixtures.empty) {
  const allMock = vi.fn().mockResolvedValue(data)
  const selectMock = vi.fn().mockReturnThis()

  const mock = vi.fn(() => ({
    select: selectMock,
    all: allMock,
  }))

  return {
    mock,
    allMock,
    selectMock,
    setData: (newData: unknown[]) => {
      allMock.mockResolvedValue(newData)
    },
  }
}

// Mock factory for queryCollectionSearchSections
export function createSearchSectionsMock(data: unknown[] = searchSectionFixtures.empty) {
  return vi.fn().mockResolvedValue(data)
}

// Setup global mocks for Nitro auto-imports
export function setupGlobalMocks() {
  vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
}

// Create a mock H3 event with proper URL for getQuery to parse
export function createMockEvent(options: {
  query?: Record<string, string>
} = {}): Parameters<typeof import('../../server/api/graph.get').default>[0] {
  const queryString = options.query
    ? '?' + new URLSearchParams(options.query).toString()
    : ''

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Mock event object for testing
  return {
    url: new URL(`http://localhost/api/test${queryString}`),
  } as Parameters<typeof import('../../server/api/graph.get').default>[0]
}
