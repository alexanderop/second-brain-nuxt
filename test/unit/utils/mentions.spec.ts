import { describe, it, expect } from 'vitest'
import {
  buildContentMapWithLinks,
  extractSlugFromSectionId,
  shouldIncludeSection,
  buildMentionsMap,
  buildMentionItems,
  findUnlinkedMentions,
  type SearchSection,
  type ContentMeta,
} from '../../../server/utils/mentions'
import type { ContentItem } from '../../../server/utils/graph'

// Test fixtures
const contentFixtures: ContentItem[] = [
  {
    path: '/atomic-habits',
    title: 'Atomic Habits',
    type: 'book',
    body: { type: 'minimark', value: [] },
  },
  {
    path: '/article-one',
    title: 'Article One',
    type: 'article',
    body: {
      type: 'minimark',
      value: [['p', {}, ['a', { href: '/atomic-habits' }, 'link']]],
    },
  },
  {
    path: '/article-two',
    title: 'Article Two',
    type: 'article',
    body: { type: 'minimark', value: [] },
  },
  {
    path: '/article-three',
    title: 'Article Three',
    type: 'article',
    body: { type: 'minimark', value: [] },
  },
]

const searchSectionFixtures: SearchSection[] = [
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
]

describe('server/utils/mentions', () => {
  describe('buildContentMapWithLinks', () => {
    it('builds map with title, type, and links', () => {
      const contentMap = buildContentMapWithLinks(contentFixtures)

      expect(contentMap.get('atomic-habits')).toEqual({
        title: 'Atomic Habits',
        type: 'book',
        linksTo: new Set(),
      })

      expect(contentMap.get('article-one')).toEqual({
        title: 'Article One',
        type: 'article',
        linksTo: new Set(['atomic-habits']),
      })
    })

    it('uses slug as title fallback when title is missing', () => {
      const content: ContentItem[] = [
        { path: '/no-title', body: { type: 'minimark', value: [] } },
      ]
      const contentMap = buildContentMapWithLinks(content)

      expect(contentMap.get('no-title')?.title).toBe('no-title')
    })

    it('uses note as type fallback when type is missing', () => {
      const content: ContentItem[] = [
        { path: '/no-type', title: 'Has Title', body: { type: 'minimark', value: [] } },
      ]
      const contentMap = buildContentMapWithLinks(content)

      expect(contentMap.get('no-type')?.type).toBe('note')
    })
  })

  describe('extractSlugFromSectionId', () => {
    it('extracts slug from section ID with leading slash', () => {
      expect(extractSlugFromSectionId('/article-one#intro')).toBe('article-one')
    })

    it('extracts slug from section ID without leading slash', () => {
      expect(extractSlugFromSectionId('article-one#intro')).toBe('article-one')
    })

    it('handles section ID with no hash', () => {
      expect(extractSlugFromSectionId('/article-one')).toBe('article-one')
    })

    it('returns empty string for empty input', () => {
      expect(extractSlugFromSectionId('')).toBe('')
    })
  })

  describe('shouldIncludeSection', () => {
    const contentMap = new Map<string, ContentMeta>([
      ['atomic-habits', { title: 'Atomic Habits', type: 'book', linksTo: new Set() }],
      ['article-one', { title: 'Article One', type: 'article', linksTo: new Set(['atomic-habits']) }],
      ['article-two', { title: 'Article Two', type: 'article', linksTo: new Set() }],
    ])
    const titleRegex = /\bAtomic Habits\b/i

    it('excludes section from target slug itself', () => {
      const section: SearchSection = { id: '/atomic-habits#intro', content: 'Atomic Habits content' }
      expect(shouldIncludeSection(section, 'atomic-habits', contentMap, titleRegex)).toBe(false)
    })

    it('excludes section that already links to target', () => {
      const section: SearchSection = { id: '/article-one#intro', content: 'Mentions Atomic Habits' }
      expect(shouldIncludeSection(section, 'atomic-habits', contentMap, titleRegex)).toBe(false)
    })

    it('includes section that mentions but does not link to target', () => {
      const section: SearchSection = { id: '/article-two#main', content: 'Discusses Atomic Habits' }
      expect(shouldIncludeSection(section, 'atomic-habits', contentMap, titleRegex)).toBe(true)
    })

    it('excludes section without matching content', () => {
      const section: SearchSection = { id: '/article-two#main', content: 'No mention here' }
      expect(shouldIncludeSection(section, 'atomic-habits', contentMap, titleRegex)).toBe(false)
    })

    it('excludes section with empty content', () => {
      const section: SearchSection = { id: '/article-two#main', content: '' }
      expect(shouldIncludeSection(section, 'atomic-habits', contentMap, titleRegex)).toBe(false)
    })

    it('handles section from unknown path not in content map', () => {
      const emptyContentMap = new Map<string, ContentMeta>()
      const section: SearchSection = { id: '/unknown#section', content: 'Atomic Habits here' }

      // Should not crash and should return true (path not in map means no links info to exclude)
      expect(shouldIncludeSection(section, 'atomic-habits', emptyContentMap, titleRegex)).toBe(true)
    })
  })

  describe('buildMentionsMap', () => {
    const contentMap = new Map<string, ContentMeta>([
      ['atomic-habits', { title: 'Atomic Habits', type: 'book', linksTo: new Set() }],
      ['article-one', { title: 'Article One', type: 'article', linksTo: new Set(['atomic-habits']) }],
      ['article-two', { title: 'Article Two', type: 'article', linksTo: new Set() }],
      ['article-three', { title: 'Article Three', type: 'article', linksTo: new Set() }],
    ])
    const titleRegex = /\bAtomic Habits\b/i

    it('finds unlinked mentions', () => {
      const mentionsMap = buildMentionsMap(searchSectionFixtures, 'atomic-habits', contentMap, titleRegex)

      // article-one links to atomic-habits, so excluded
      expect(mentionsMap.has('article-one')).toBe(false)

      // article-three mentions but doesn't link
      expect(mentionsMap.has('article-three')).toBe(true)
    })

    it('takes first section per path', () => {
      const sections: SearchSection[] = [
        { id: '/article-two#first', content: 'First mention of Atomic Habits' },
        { id: '/article-two#second', content: 'Second mention of Atomic Habits' },
      ]
      const mentionsMap = buildMentionsMap(sections, 'atomic-habits', contentMap, titleRegex)

      expect(mentionsMap.get('article-two')?.content).toBe('First mention of Atomic Habits')
    })

    it('uses titles[0] as sectionTitle when available', () => {
      const sections: SearchSection[] = [
        { id: '/article-two#section', content: 'Atomic Habits mention', titles: ['First Title', 'Second'], title: 'Fallback' },
      ]
      const mentionsMap = buildMentionsMap(sections, 'atomic-habits', contentMap, titleRegex)

      expect(mentionsMap.get('article-two')?.sectionTitle).toBe('First Title')
    })

    it('uses title as sectionTitle fallback when titles is empty', () => {
      const sections: SearchSection[] = [
        { id: '/article-two#section', content: 'Atomic Habits mention', titles: [], title: 'Title Fallback' },
      ]
      const mentionsMap = buildMentionsMap(sections, 'atomic-habits', contentMap, titleRegex)

      expect(mentionsMap.get('article-two')?.sectionTitle).toBe('Title Fallback')
    })

    it('uses path as sectionTitle fallback when both titles and title are missing', () => {
      const sections: SearchSection[] = [
        { id: '/article-two#section', content: 'Atomic Habits mention' },
      ]
      const mentionsMap = buildMentionsMap(sections, 'atomic-habits', contentMap, titleRegex)

      expect(mentionsMap.get('article-two')?.sectionTitle).toBe('article-two')
    })
  })

  describe('buildMentionItems', () => {
    const contentMap = new Map<string, ContentMeta>([
      ['article-two', { title: 'Article Two', type: 'article', linksTo: new Set() }],
    ])

    it('builds mention items with snippets', () => {
      const mentionsByPath = new Map([
        ['article-two', { content: 'This is about Atomic Habits and productivity.', sectionTitle: 'Section' }],
      ])

      const mentions = buildMentionItems(mentionsByPath, contentMap, 'Atomic Habits')

      expect(mentions).toHaveLength(1)
      expect(mentions[0]).toMatchObject({
        slug: 'article-two',
        title: 'Article Two',
        type: 'article',
      })
      expect(mentions[0].snippet).toContain('Atomic Habits')
      expect(mentions[0].highlightedSnippet).toMatch(/<mark[^>]*>/)
    })

    it('skips paths not in content map', () => {
      const mentionsByPath = new Map([
        ['unknown-path', { content: 'Some content', sectionTitle: 'Section' }],
      ])

      const mentions = buildMentionItems(mentionsByPath, contentMap, 'Test')

      expect(mentions).toHaveLength(0)
    })
  })

  describe('findUnlinkedMentions', () => {
    it('returns empty for missing slug', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, '', 'Atomic Habits')
      expect(result).toEqual([])
    })

    it('returns empty for missing title', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, 'atomic-habits', '')
      expect(result).toEqual([])
    })

    it('returns empty for short title (< 3 chars)', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, 'atomic-habits', 'AB')
      expect(result).toEqual([])
    })

    it('finds unlinked mentions excluding direct links', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, 'atomic-habits', 'Atomic Habits')

      // article-one links directly, so excluded
      // article-three mentions without linking, so included
      const slugs = result.map(m => m.slug)
      expect(slugs).not.toContain('article-one')
      expect(slugs).toContain('article-three')
    })

    it('includes highlighted snippets', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, 'atomic-habits', 'Atomic Habits')

      const mention = result.find(m => m.slug === 'article-three')
      expect(mention).toBeDefined()
      expect(mention?.highlightedSnippet).toMatch(/<mark[^>]*>/)
    })

    it('proceeds for title with exactly 3 characters', () => {
      const content: ContentItem[] = [
        { path: '/article', title: 'Article', type: 'article', body: { type: 'minimark', value: [] } },
        { path: '/abc', title: 'ABC', type: 'note', body: { type: 'minimark', value: [] } },
      ]
      const sections: SearchSection[] = [
        { id: '/article#section', content: 'This mentions ABC in the text' },
      ]

      // Title "ABC" has length 3, which is >= 3, so should proceed (not return early)
      const result = findUnlinkedMentions(content, sections, 'abc', 'ABC')
      expect(result.length).toBe(1)
    })

    it('returns empty for title with exactly 2 characters', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, 'ab', 'AB')
      expect(result).toEqual([])
    })

    it('matches title case-insensitively', () => {
      const contentWithLowercase: ContentItem[] = [
        { path: '/article', title: 'Article', type: 'article', body: { type: 'minimark', value: [] } },
        { path: '/target', title: 'Target', type: 'note', body: { type: 'minimark', value: [] } },
      ]
      const sections: SearchSection[] = [
        { id: '/article#section', content: 'This mentions TARGET in uppercase' },
      ]

      const result = findUnlinkedMentions(contentWithLowercase, sections, 'target', 'Target')
      expect(result.length).toBe(1)
      expect(result[0].slug).toBe('article')
    })

    it('only matches whole words not partial matches', () => {
      const content: ContentItem[] = [
        { path: '/article', title: 'Article', type: 'article', body: { type: 'minimark', value: [] } },
        { path: '/cat', title: 'Cat', type: 'note', body: { type: 'minimark', value: [] } },
      ]
      const sections: SearchSection[] = [
        { id: '/article#section', content: 'I love my category of cats' },
      ]

      // "Cat" should not match "category" or "cats"
      const result = findUnlinkedMentions(content, sections, 'cat', 'Cat')
      expect(result).toEqual([])
    })

    it('returns empty for title with length 1', () => {
      const result = findUnlinkedMentions(contentFixtures, searchSectionFixtures, 'x', 'X')
      expect(result).toEqual([])
    })

    it('differentiates between 2-char and 3-char titles at boundary', () => {
      const content: ContentItem[] = [
        { path: '/article', title: 'Article', type: 'article', body: { type: 'minimark', value: [] } },
        { path: '/ab', title: 'AB', type: 'note', body: { type: 'minimark', value: [] } },
      ]
      const sections: SearchSection[] = [
        { id: '/article#section', content: 'This mentions AB in text' },
      ]

      // 2-char title should NOT search (too short, returns early)
      const result2 = findUnlinkedMentions(content, sections, 'ab', 'AB')
      expect(result2).toEqual([])

      // 3-char title SHOULD find mentions
      const contentWith3Char: ContentItem[] = [
        { path: '/article', title: 'Article', type: 'article', body: { type: 'minimark', value: [] } },
        { path: '/abc', title: 'ABC', type: 'note', body: { type: 'minimark', value: [] } },
      ]
      const sectionsFor3: SearchSection[] = [
        { id: '/article#section', content: 'This mentions ABC in text' },
      ]
      const result3 = findUnlinkedMentions(contentWith3Char, sectionsFor3, 'abc', 'ABC')
      expect(result3.length).toBe(1)
    })
  })
})
