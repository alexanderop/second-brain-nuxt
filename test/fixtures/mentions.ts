/**
 * Mentions response fixtures for integration tests
 *
 * Note: These fixtures match the MentionItem type from server/utils/mentions.ts
 */

export interface MentionItemFixture {
  slug: string
  title: string
  type: string
  snippet: string
  highlightedSnippet: string
}

export const emptyMentions: MentionItemFixture[] = []

export const singleMention: MentionItemFixture[] = [
  {
    slug: 'article-three',
    title: 'Article Three',
    type: 'article',
    snippet: '...reference to Atomic Habits in this section...',
    highlightedSnippet: '...reference to <mark>Atomic Habits</mark> in this section...',
  },
]

export const multipleMentions: MentionItemFixture[] = [
  {
    slug: 'article-three',
    title: 'Article Three',
    type: 'article',
    snippet: '...another reference to Atomic Habits here...',
    highlightedSnippet: '...another reference to <mark>Atomic Habits</mark> here...',
  },
  {
    slug: 'podcast-episode',
    title: 'Podcast Episode',
    type: 'podcast',
    snippet: '...discussing Atomic Habits and productivity...',
    highlightedSnippet: '...discussing <mark>Atomic Habits</mark> and productivity...',
  },
]

export function createMentionItem(overrides: Partial<MentionItemFixture> = {}): MentionItemFixture {
  return {
    slug: 'mention-slug',
    title: 'Mention Title',
    type: 'article',
    snippet: '...mention snippet...',
    highlightedSnippet: '...<mark>mention</mark> snippet...',
    ...overrides,
  }
}
