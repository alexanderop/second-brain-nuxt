/**
 * Search section fixtures for integration tests
 * Used for testing mentions and search functionality
 */

export interface SearchSectionFixture {
  id: string
  title: string
  titles: string[]
  content: string
}

export const emptySearchSections: SearchSectionFixture[] = []

export const withMentions: SearchSectionFixture[] = [
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
