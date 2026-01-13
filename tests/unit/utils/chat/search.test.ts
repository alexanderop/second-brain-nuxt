import { describe, expect, it } from 'vitest'
import {
  extractKeywords,
  matchesTag,
  scoreNote,
  filterAndScoreNotes,
  formatNoteContent,
  formatSearchResults,
} from '../../../../server/utils/chat/search'
import type { RawNote } from '../../../../server/utils/chat/search'

describe('extractKeywords', () => {
  it('extracts basic keywords from message', () => {
    expect(extractKeywords('vue reactivity patterns')).toEqual(['vue', 'reactivity', 'patterns'])
  })

  it('filters out stop words', () => {
    expect(extractKeywords('what is the vue framework')).toEqual(['vue', 'framework'])
  })

  it('filters out short words', () => {
    expect(extractKeywords('a vs an in vue')).toEqual(['vue'])
  })

  it('converts to lowercase', () => {
    expect(extractKeywords('Vue PATTERNS TypeScript')).toEqual(['vue', 'patterns', 'typescript'])
  })

  it('removes punctuation', () => {
    expect(extractKeywords('vue.js, react! angular?')).toEqual(['vue', 'react', 'angular'])
  })

  it('preserves hyphens in words', () => {
    expect(extractKeywords('server-side rendering')).toEqual(['server-side', 'rendering'])
  })

  it('limits to 8 keywords', () => {
    const result = extractKeywords('one two three four five six seven eight nine ten eleven')
    expect(result.length).toBeLessThanOrEqual(8)
  })

  it('handles empty string', () => {
    expect(extractKeywords('')).toEqual([])
  })

  it('handles string with only stop words', () => {
    expect(extractKeywords('the is a an')).toEqual([])
  })
})

describe('matchesTag', () => {
  it('matches exact tag', () => {
    expect(matchesTag(['vue', 'typescript'], 'vue')).toBe(true)
  })

  it('matches partial tag (keyword in tag)', () => {
    expect(matchesTag(['typescript', 'javascript'], 'script')).toBe(true)
  })

  it('matches partial tag (tag in keyword)', () => {
    // 'type' is a substring of 'typescript'
    expect(matchesTag(['vue', 'type'], 'typescript')).toBe(true)
  })

  it('returns false when no match', () => {
    expect(matchesTag(['vue', 'typescript'], 'react')).toBe(false)
  })

  it('handles empty tags array', () => {
    expect(matchesTag([], 'vue')).toBe(false)
  })
})

describe('scoreNote', () => {
  it('scores title matches with weight 2', () => {
    const note: RawNote = { title: 'Vue Reactivity Guide', tags: [] }
    expect(scoreNote(note, ['vue'])).toBe(2)
  })

  it('scores summary matches with weight 1', () => {
    const note: RawNote = { title: 'Other', summary: 'Learn about vue', tags: [] }
    expect(scoreNote(note, ['vue'])).toBe(1)
  })

  it('scores tag matches with weight 3', () => {
    const note: RawNote = { title: 'Other', tags: ['vue'] }
    expect(scoreNote(note, ['vue'])).toBe(3)
  })

  it('accumulates scores across fields', () => {
    const note: RawNote = {
      title: 'Vue Patterns',
      summary: 'Vue reactivity',
      tags: ['vue'],
    }
    expect(scoreNote(note, ['vue'])).toBe(2 + 1 + 3) // title + summary + tag
  })

  it('accumulates scores across multiple keywords', () => {
    const note: RawNote = { title: 'Vue TypeScript Guide', tags: [] }
    expect(scoreNote(note, ['vue', 'typescript'])).toBe(4) // 2 + 2
  })

  it('returns 0 for no matches', () => {
    const note: RawNote = { title: 'React Guide', tags: ['react'] }
    expect(scoreNote(note, ['vue'])).toBe(0)
  })

  it('handles missing fields gracefully', () => {
    const note: RawNote = {}
    expect(scoreNote(note, ['vue'])).toBe(0)
  })
})

describe('filterAndScoreNotes', () => {
  const sampleNotes: RawNote[] = [
    { title: 'Vue Basics', stem: 'vue-basics', path: '/vue-basics', tags: ['vue'] },
    { title: 'React Intro', stem: 'react-intro', path: '/react-intro', tags: ['react'] },
    { title: 'TypeScript Guide', stem: 'typescript-guide', path: '/typescript-guide', tags: ['typescript', 'vue'] },
    { title: 'Angular Tips', stem: 'angular-tips', path: '/angular-tips', tags: ['angular'] },
  ]

  it('filters and returns matching notes', () => {
    const result = filterAndScoreNotes(sampleNotes, ['vue'], 10)
    expect(result.length).toBe(2)
    expect(result.map(n => n.title)).toContain('Vue Basics')
    expect(result.map(n => n.title)).toContain('TypeScript Guide')
  })

  it('sorts by score descending', () => {
    const result = filterAndScoreNotes(sampleNotes, ['vue'], 10)
    // Vue Basics has title + tag match, TypeScript Guide has only tag match
    expect(result[0].title).toBe('Vue Basics')
  })

  it('respects limit parameter', () => {
    const result = filterAndScoreNotes(sampleNotes, ['vue'], 1)
    expect(result.length).toBe(1)
  })

  it('caps limit at 10', () => {
    const manyNotes = Array.from({ length: 20 }, (_, i) => ({
      title: `Vue Note ${i}`,
      stem: `vue-note-${i}`,
      path: `/vue-note-${i}`,
      tags: ['vue'],
    }))
    const result = filterAndScoreNotes(manyNotes, ['vue'], 100)
    expect(result.length).toBe(10)
  })

  it('excludes notes with score 0', () => {
    const result = filterAndScoreNotes(sampleNotes, ['python'], 10)
    expect(result.length).toBe(0)
  })

  it('returns correct NoteContext shape', () => {
    const result = filterAndScoreNotes(sampleNotes, ['vue'], 1)
    expect(result[0]).toHaveProperty('title')
    expect(result[0]).toHaveProperty('summary')
    expect(result[0]).toHaveProperty('path')
  })

  it('uses stem as fallback for title', () => {
    const notesWithoutTitle: RawNote[] = [
      { stem: 'my-note', path: '/my-note', tags: ['vue'] },
    ]
    const result = filterAndScoreNotes(notesWithoutTitle, ['vue'], 10)
    expect(result[0].title).toBe('my-note')
  })
})

describe('formatNoteContent', () => {
  it('formats complete note', () => {
    const note: RawNote = {
      title: 'Vue Guide',
      summary: 'A guide to Vue',
      notes: 'Detailed notes here',
      tags: ['vue', 'javascript'],
      type: 'article',
      path: '/vue-guide',
    }
    const result = formatNoteContent(note)
    expect(result).toEqual({
      title: 'Vue Guide',
      summary: 'A guide to Vue',
      notes: 'Detailed notes here',
      tags: ['vue', 'javascript'],
      type: 'article',
      path: '/vue-guide',
    })
  })

  it('provides defaults for missing fields', () => {
    const note: RawNote = { stem: 'test-note' }
    const result = formatNoteContent(note)
    expect(result.title).toBe('test-note')
    expect(result.summary).toBeNull()
    expect(result.notes).toBeNull()
    expect(result.tags).toEqual([])
    expect(result.type).toBe('note')
    expect(result.path).toBe('/test-note')
  })

  it('uses Untitled for completely empty note', () => {
    const note: RawNote = {}
    const result = formatNoteContent(note)
    expect(result.title).toBe('Untitled')
  })
})

describe('formatSearchResults', () => {
  it('formats array of notes', () => {
    const notes: RawNote[] = [
      { title: 'Note One', summary: 'First note', path: '/note-one' },
      { title: 'Note Two', summary: 'Second note', path: '/note-two' },
    ]
    const result = formatSearchResults(notes)
    expect(result).toEqual([
      { title: 'Note One', summary: 'First note', path: '/note-one' },
      { title: 'Note Two', summary: 'Second note', path: '/note-two' },
    ])
  })

  it('handles empty array', () => {
    expect(formatSearchResults([])).toEqual([])
  })

  it('provides defaults for missing fields', () => {
    const notes: RawNote[] = [{ stem: 'my-note' }]
    const result = formatSearchResults(notes)
    expect(result[0]).toEqual({
      title: 'my-note',
      summary: null,
      path: '/my-note',
    })
  })
})
