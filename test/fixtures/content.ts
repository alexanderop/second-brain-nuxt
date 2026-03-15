/**
 * Content fixtures for integration tests
 * These represent realistic content items with minimark body format
 */

export interface ContentFixture {
  path: string
  stem: string
  title: string
  type: string
  tags: string[]
  summary?: string
  body: {
    type: 'minimark'
    value: unknown[]
  }
}

export const emptyContent: ContentFixture[] = []

export const simpleNote: ContentFixture[] = [
  {
    path: '/note-a',
    stem: 'note-a',
    title: 'Note A',
    type: 'note',
    tags: [],
    summary: 'A simple note',
    body: { type: 'minimark', value: [] },
  },
]

export const linkedNotes: ContentFixture[] = [
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
]

export const multipleLinks: ContentFixture[] = [
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
]
