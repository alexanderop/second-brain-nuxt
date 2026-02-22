import type { NoteContext, NoteContent } from './tools'

// Raw note type from database query
export interface RawNote {
  title?: string
  summary?: string
  notes?: string
  path?: string
  stem?: string
  tags?: string[]
  type?: string
  url?: string
  rawbody?: string
}

// Common stop words to filter out from search
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'or', 'and', 'but', 'if', 'for', 'not', 'no', 'can', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'any', 'of', 'at', 'by', 'with',
])

/**
 * Extract meaningful keywords from a search query.
 * Removes stop words and short words.
 */
export function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 8)
}

/**
 * Check if any tag matches a keyword.
 */
export function matchesTag(tagsLower: string[], keyword: string): boolean {
  return tagsLower.some(tag => tag === keyword || tag.includes(keyword) || keyword.includes(tag))
}

/**
 * Calculate a relevance score for a note based on keywords.
 * Higher scores indicate better matches.
 */
export function scoreNote(note: RawNote, keywords: string[]): number {
  const titleLower = (note.title ?? '').toLowerCase()
  const summaryLower = (note.summary ?? '').toLowerCase()
  const tagsLower = (note.tags ?? []).map(t => t.toLowerCase())

  return keywords.reduce((score, keyword) => {
    let keywordScore = 0
    if (titleLower.includes(keyword)) keywordScore += 2
    if (summaryLower.includes(keyword)) keywordScore += 1
    if (matchesTag(tagsLower, keyword)) keywordScore += 3
    return score + keywordScore
  }, 0)
}

/**
 * Filter and score notes, returning the top matches.
 * Pure function - no side effects.
 */
export function filterAndScoreNotes(
  notes: RawNote[],
  keywords: string[],
  limit: number = 5,
): NoteContext[] {
  const maxLimit = Math.min(limit, 10)

  return notes
    .map(note => ({ note, score: scoreNote(note, keywords) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLimit)
    .map(item => ({
      title: noteTitle(item.note),
      summary: item.note.summary ?? null,
      path: notePath(item.note),
    }))
}

function noteTitle(note: RawNote): string {
  return note.title ?? note.stem ?? 'Untitled'
}

function notePath(note: RawNote): string {
  return note.path ?? `/${note.stem}`
}

/**
 * Format a raw note into the NoteContent shape.
 * Pure function - no side effects.
 */
export function formatNoteContent(note: RawNote): NoteContent {
  return {
    title: noteTitle(note),
    summary: note.summary ?? null,
    notes: note.notes ?? null,
    tags: note.tags ?? [],
    type: note.type ?? 'note',
    path: notePath(note),
    url: note.url ?? null,
    content: note.rawbody?.slice(0, 3000) ?? null,
  }
}

/**
 * Format raw notes into NoteContext array.
 * Pure function - no side effects.
 */
export function formatSearchResults(notes: RawNote[]): NoteContext[] {
  return notes.map(note => ({
    title: noteTitle(note),
    summary: note.summary ?? null,
    path: notePath(note),
  }))
}

/**
 * Keyword search over notes.
 * Wrapper around filterAndScoreNotes with consistent interface.
 */
export function keywordSearch(
  query: string,
  notes: RawNote[],
  options: { limit?: number; type?: string } = {},
): NoteContext[] {
  const { limit = 5, type } = options
  const keywords = extractKeywords(query)

  const filteredNotes = type
    ? notes.filter(n => n.type === type)
    : notes

  return filterAndScoreNotes(filteredNotes, keywords, limit)
}
