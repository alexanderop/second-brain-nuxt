import { globSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import type { SlugCache } from './types.ts'

let cache: SlugCache | null = null
let cachedContentPath: string | null = null

/**
 * Get cached slugs for authors and notes
 * Performs a one-time synchronous glob at lint start
 * Subsequent calls return cached results (O(1) lookups)
 */
export function getSlugCache(contentPath: string = 'content'): SlugCache {
  const resolvedPath = resolve(contentPath)

  // Return cached if path matches
  if (cache && cachedContentPath === resolvedPath) {
    return cache
  }

  const authors = new Set<string>()
  const notes = new Set<string>()

  // Glob author files
  try {
    const authorFiles = globSync(`${resolvedPath}/authors/*.md`)
    for (const file of authorFiles) {
      authors.add(basename(file, '.md'))
    }
  }
  catch {
    // Directory might not exist
  }

  // Glob all content files (excluding authors, pages, podcasts)
  try {
    const noteFiles = globSync(`${resolvedPath}/**/*.md`, {
      ignore: [
        `${resolvedPath}/authors/**`,
        `${resolvedPath}/pages/**`,
        `${resolvedPath}/podcasts/**`,
      ],
    })
    for (const file of noteFiles) {
      notes.add(basename(file, '.md'))
    }
  }
  catch {
    // Directory might not exist
  }

  cache = {
    authors,
    notes,
    all: new Set([...authors, ...notes]),
  }
  cachedContentPath = resolvedPath

  return cache
}

/**
 * Invalidate the slug cache
 * Call this when files are added/removed during watch mode
 */
export function invalidateCache(): void {
  cache = null
  cachedContentPath = null
}

/**
 * Simple Levenshtein distance for typo suggestions
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Find similar slugs for typo suggestions
 * Returns the closest match within 3 edits, or null
 */
export function findSimilarSlug(slug: string, slugs: Set<string>): string | null {
  let best: string | null = null
  let bestScore = Infinity

  for (const candidate of slugs) {
    const score = levenshtein(slug.toLowerCase(), candidate.toLowerCase())
    if (score < bestScore && score <= 3) {
      bestScore = score
      best = candidate
    }
  }

  return best
}
