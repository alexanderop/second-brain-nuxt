import type { NoteContext, NoteContent } from './tools'
import { semanticSearch } from './semanticSearch'

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
      title: item.note.title ?? item.note.stem ?? 'Untitled',
      summary: item.note.summary ?? null,
      path: item.note.path ?? `/${item.note.stem}`,
    }))
}

/** Get displayable title from a note, with fallbacks */
function getNoteTitle(note: RawNote): string {
  return note.title ?? note.stem ?? 'Untitled'
}

/** Get note path with stem fallback */
function getNotePath(note: RawNote): string {
  return note.path ?? `/${note.stem}`
}

/**
 * Format a raw note into the NoteContent shape.
 * Pure function - no side effects.
 */
export function formatNoteContent(note: RawNote): NoteContent {
  const content = note.rawbody?.slice(0, 3000) // First 3000 chars for token efficiency
  return {
    title: getNoteTitle(note),
    summary: note.summary ?? null,
    notes: note.notes ?? null,
    tags: note.tags ?? [],
    type: note.type ?? 'note',
    path: getNotePath(note),
    url: note.url ?? null,
    content: content ?? null,
  }
}

/**
 * Format raw notes into NoteContext array.
 * Pure function - no side effects.
 */
export function formatSearchResults(notes: RawNote[]): NoteContext[] {
  return notes.map(note => ({
    title: note.title ?? note.stem ?? 'Untitled',
    summary: note.summary ?? null,
    path: note.path ?? `/${note.stem}`,
  }))
}

// Scoring weights for hybrid search (matches client-side)
const KEYWORD_WEIGHT = 0.4
const SEMANTIC_WEIGHT = 0.6

// Minimum hybrid score to include in results (filters out very low-relevance matches)
const MIN_HYBRID_SCORE = 0.15

export interface HybridSearchResult extends NoteContext {
  keywordScore: number
  semanticScore: number
  hybridScore: number
}

/**
 * Performs hybrid search combining keyword and semantic search.
 *
 * - Keyword search: exact matches in title, summary, tags
 * - Semantic search: conceptual similarity via embeddings
 * - Final score: 40% keyword + 60% semantic
 *
 * @param query - Search query text
 * @param notes - All notes from database
 * @param options - Search options (limit, type filter)
 * @returns Hybrid-scored search results
 */
export async function hybridSearch(
  query: string,
  notes: RawNote[],
  options: { limit?: number; type?: string } = {},
): Promise<NoteContext[]> {
  const { limit = 5, type } = options
  const maxLimit = Math.min(limit, 10)
  const keywords = extractKeywords(query)

  // Filter by type if specified
  const filteredNotes = type
    ? notes.filter(n => n.type === type)
    : notes

  // Run keyword and semantic search in parallel
  const [keywordResults, semanticResults] = await Promise.all([
    // Keyword search (synchronous, wrap in promise for parallel execution)
    Promise.resolve(
      filteredNotes
        .map(note => ({
          slug: note.stem ?? '',
          title: note.title ?? note.stem ?? 'Untitled',
          summary: note.summary ?? null,
          path: note.path ?? `/${note.stem}`,
          score: scoreNote(note, keywords),
        }))
        .filter(item => item.score > 0),
    ),
    // Semantic search
    semanticSearch(query, 50),
  ])

  // Normalize keyword scores to 0-1 range
  const maxKeywordScore = Math.max(...keywordResults.map(r => r.score), 1)
  const normalizedKeyword = keywordResults.map(r => ({
    ...r,
    score: r.score / maxKeywordScore,
  }))

  // Build result map for merging
  const resultMap = new Map<string, HybridSearchResult>()

  // Add keyword results
  for (const kr of normalizedKeyword) {
    resultMap.set(kr.slug, {
      title: kr.title,
      summary: kr.summary,
      path: kr.path,
      keywordScore: kr.score,
      semanticScore: 0,
      hybridScore: kr.score * KEYWORD_WEIGHT,
    })
  }

  // Merge semantic results (filter by type if needed)
  const filteredSemantic = type
    ? semanticResults.filter(sr => sr.type === type)
    : semanticResults

  for (const sr of filteredSemantic) {
    const existing = resultMap.get(sr.slug)
    if (existing) {
      existing.semanticScore = sr.score
      existing.hybridScore = existing.keywordScore * KEYWORD_WEIGHT + sr.score * SEMANTIC_WEIGHT
      continue
    }

    // Semantic-only result: find the note to get summary
    const note = filteredNotes.find(n => n.stem === sr.slug)
    resultMap.set(sr.slug, {
      title: sr.title,
      summary: note?.summary ?? null,
      path: `/${sr.slug}`,
      keywordScore: 0,
      semanticScore: sr.score,
      hybridScore: sr.score * SEMANTIC_WEIGHT,
    })
  }

  // Sort by hybrid score and return top results
  const results = Array.from(resultMap.values())
  results.sort((a, b) => b.hybridScore - a.hybridScore)

  // Filter out low-confidence results
  const filteredResults = results.filter(r => r.hybridScore >= MIN_HYBRID_SCORE)

  // Return as NoteContext (strip internal scores)
  return filteredResults.slice(0, maxLimit).map(r => ({
    title: r.title,
    summary: r.summary,
    path: r.path,
  }))
}

/**
 * Keyword-only search (for mode='keyword').
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
