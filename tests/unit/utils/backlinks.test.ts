import { describe, it, expect } from 'vitest'
import {
  buildContentMap,
  addBacklinksForItem,
  buildBacklinksIndex,
  type BacklinksIndex,
} from '../../../server/utils/backlinks'
import type { ContentItem } from '../../../server/utils/graph'

// Test fixtures with proper typing
const fixtures: Record<string, ContentItem[]> = {
  empty: [],

  linkedNotes: [
    {
      path: '/note-a',
      stem: 'note-a',
      title: 'Note A',
      type: 'note',
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
      body: { type: 'minimark', value: [] },
    },
  ],

  multipleLinks: [
    {
      path: '/atomic-habits',
      stem: 'atomic-habits',
      title: 'Atomic Habits',
      type: 'book',
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
      body: { type: 'minimark', value: [] },
    },
  ],
}

describe('server/utils/backlinks', () => {
  describe('buildContentMap', () => {
    it('builds map with title and type', () => {
      const contentMap = buildContentMap(fixtures.linkedNotes)

      expect(contentMap.get('note-a')).toEqual({
        title: 'Note A',
        type: 'note',
      })
      expect(contentMap.get('note-b')).toEqual({
        title: 'Note B',
        type: 'article',
      })
    })

    it('defaults to slug for title if missing', () => {
      const content: ContentItem[] = [{ path: '/untitled' }]
      const contentMap = buildContentMap(content)

      expect(contentMap.get('untitled')?.title).toBe('untitled')
    })

    it('defaults to note for type if missing', () => {
      const content: ContentItem[] = [{ path: '/untitled' }]
      const contentMap = buildContentMap(content)

      expect(contentMap.get('untitled')?.type).toBe('note')
    })
  })

  describe('addBacklinksForItem', () => {
    it('adds backlinks for linked items', () => {
      const item = fixtures.linkedNotes[0]
      const sourceMeta = { title: 'Note A', type: 'note' }
      const backlinksIndex: BacklinksIndex = {}

      addBacklinksForItem(item, sourceMeta, 'note-a', backlinksIndex)

      expect(backlinksIndex['note-b']).toEqual([
        { slug: 'note-a', title: 'Note A', type: 'note' },
      ])
    })

    it('ignores self-links', () => {
      const item: ContentItem = {
        path: '/note-a',
        body: {
          type: 'minimark',
          value: [['p', {}, ['a', { href: '/note-a' }, 'self']]],
        },
      }
      const sourceMeta = { title: 'Note A', type: 'note' }
      const backlinksIndex: BacklinksIndex = {}

      addBacklinksForItem(item, sourceMeta, 'note-a', backlinksIndex)

      expect(backlinksIndex['note-a']).toBeUndefined()
    })

    it('accumulates multiple backlinks', () => {
      const backlinksIndex: BacklinksIndex = {}

      // First note links to target
      addBacklinksForItem(
        { path: '/note-a', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/target' }, 'link']]] } },
        { title: 'Note A', type: 'note' },
        'note-a',
        backlinksIndex,
      )

      // Second note also links to target
      addBacklinksForItem(
        { path: '/note-b', body: { type: 'minimark', value: [['p', {}, ['a', { href: '/target' }, 'link']]] } },
        { title: 'Note B', type: 'article' },
        'note-b',
        backlinksIndex,
      )

      expect(backlinksIndex['target']).toHaveLength(2)
      expect(backlinksIndex['target']).toEqual([
        { slug: 'note-a', title: 'Note A', type: 'note' },
        { slug: 'note-b', title: 'Note B', type: 'article' },
      ])
    })
  })

  describe('buildBacklinksIndex', () => {
    it('returns empty object for no content', () => {
      const result = buildBacklinksIndex(fixtures.empty)

      expect(result).toEqual({})
    })

    it('builds index from linked notes', () => {
      const result = buildBacklinksIndex(fixtures.linkedNotes)

      expect(result['note-b']).toEqual([
        { slug: 'note-a', title: 'Note A', type: 'note' },
      ])
    })

    it('handles bidirectional links', () => {
      const result = buildBacklinksIndex(fixtures.multipleLinks)

      // deep-work is linked by atomic-habits
      expect(result['deep-work']).toContainEqual({
        slug: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
      })

      // atomic-habits is linked by deep-work
      expect(result['atomic-habits']).toContainEqual({
        slug: 'deep-work',
        title: 'Deep Work',
        type: 'book',
      })
    })

    it('handles multiple incoming links', () => {
      const result = buildBacklinksIndex(fixtures.multipleLinks)

      // atomic-habits links to both deep-work and thinking-fast-and-slow
      expect(result['deep-work']).toContainEqual({
        slug: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
      })
      expect(result['thinking-fast-and-slow']).toContainEqual({
        slug: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
      })
    })
  })
})
