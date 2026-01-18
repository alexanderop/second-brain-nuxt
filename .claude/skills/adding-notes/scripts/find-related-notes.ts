#!/usr/bin/env npx tsx
/**
 * Find related notes using the project's pre-generated embeddings.
 *
 * Reuses public/embeddings.json (bge-small-en-v1.5) for consistency with app search.
 * Combines vector similarity with tag/author matching for hybrid scoring.
 *
 * Usage:
 *   npx tsx find-related-notes.ts content/my-note.md
 *   npx tsx find-related-notes.ts content/my-note.md --limit 5 --min-score 10
 *   npx tsx find-related-notes.ts content/my-note.md --no-mentions
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, basename, dirname } from 'node:path'
import { parseArgs } from 'node:util'

// ============================================================================
// Configuration
// ============================================================================

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname)
const PROJECT_ROOT = resolve(SCRIPT_DIR, '../../../..')
const CONTENT_DIR = resolve(PROJECT_ROOT, 'content')
const EMBEDDINGS_PATH = resolve(PROJECT_ROOT, 'public/embeddings.json')
const MENTIONS_API = 'http://localhost:3000/api/mentions'

// ============================================================================
// Types
// ============================================================================

interface EmbeddingEntry {
  vector: number[]
  title: string
  type: string
  hash?: string
}

interface EmbeddingsData {
  version: string
  model: string
  generatedAt?: string
  textMaxLength?: number
  embeddings: Record<string, EmbeddingEntry>
}

interface Note {
  slug: string
  path: string
  title: string
  type: string
  tags: string[]
  authors: string[]
}

interface ScoredNote {
  note: Note
  score: number
  breakdown: string[]
}

interface Mention {
  slug: string
  snippet: string
}

// ============================================================================
// Frontmatter Parsing
// ============================================================================

function parseFrontmatter(filepath: string): Note | null {
  let content: string
  try {
    content = readFileSync(filepath, 'utf-8')
  } catch {
    console.error(`Warning: Could not read ${filepath}`)
    return null
  }

  // Extract frontmatter between --- markers
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (!match) return null

  const frontmatter = match[1]!

  // Simple YAML parsing (handles common cases)
  const data: Record<string, string | string[]> = {}
  let currentKey: string | null = null
  let currentList: string[] | null = null

  for (const line of frontmatter.split('\n')) {
    // List item
    if (line.trim().startsWith('- ') && currentKey) {
      if (currentList === null) {
        currentList = []
        data[currentKey] = currentList
      }
      const item = line.trim().slice(2).trim().replace(/^["']|["']$/g, '')
      currentList.push(item)
    }
    // Key-value pair
    else if (line.includes(':') && !line.startsWith(' ')) {
      currentList = null
      const colonIndex = line.indexOf(':')
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '')
      currentKey = key
      if (value) {
        data[key] = value
      }
    }
  }

  // Skip author files
  if (filepath.includes('/authors/')) {
    return null
  }

  const slug = basename(filepath, '.md')
  return {
    slug,
    path: filepath,
    title: (data.title as string) || slug,
    type: (data.type as string) || 'note',
    tags: Array.isArray(data.tags) ? data.tags : [],
    authors: Array.isArray(data.authors) ? data.authors : [],
  }
}

function getAllNotes(): Note[] {
  const notes: Note[] = []

  try {
    const files = readdirSync(CONTENT_DIR)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const filepath = resolve(CONTENT_DIR, file)
      const stat = statSync(filepath)
      if (!stat.isFile()) continue

      const note = parseFrontmatter(filepath)
      if (note) notes.push(note)
    }
  } catch (err) {
    console.error(`Error reading content directory: ${err}`)
  }

  return notes
}

// ============================================================================
// Embeddings
// ============================================================================

function loadEmbeddings(): EmbeddingsData | null {
  try {
    const content = readFileSync(EMBEDDINGS_PATH, 'utf-8')
    return JSON.parse(content) as EmbeddingsData
  } catch (err) {
    console.error(`Error loading embeddings: ${err}`)
    console.error(`Make sure to run 'pnpm generate:embeddings' first`)
    return null
  }
}

function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i]! * b[i]!
  }
  return sum
}

// ============================================================================
// Scoring
// ============================================================================

function computeTagFrequencies(notes: Note[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const note of notes) {
    for (const tag of note.tags) {
      freq.set(tag, (freq.get(tag) || 0) + 1)
    }
  }
  return freq
}

function computeScore(
  target: Note,
  candidate: Note,
  targetEmbedding: number[],
  candidateEmbedding: number[],
  tagFreq: Map<string, number>
): { score: number; breakdown: string[] } {
  let score = 0
  const breakdown: string[] = []

  // 1. Semantic similarity (dot product for normalized vectors = cosine similarity)
  const similarity = dotProduct(targetEmbedding, candidateEmbedding)
  const semanticScore = similarity * 50 // Scale to 0-50 points
  score += semanticScore
  breakdown.push(`+${semanticScore.toFixed(0)}  Semantic similarity (${(similarity * 100).toFixed(0)}%)`)

  // 2. Tag overlap (weighted by rarity)
  const targetTags = new Set(target.tags)
  const sharedTags = candidate.tags.filter(t => targetTags.has(t))
  if (sharedTags.length > 0) {
    let tagScore = 0
    const tagDetails: string[] = []
    for (const tag of sharedTags) {
      const freq = tagFreq.get(tag) || 1
      // Rare tags worth more: 10 / log(1 + freq)
      const weight = 10 / Math.log(1 + freq)
      tagScore += weight
      const rarity = freq <= 3 ? 'rare' : freq >= 10 ? 'common' : ''
      tagDetails.push(tag + (rarity ? ` (${rarity})` : ''))
    }
    score += tagScore
    breakdown.push(`+${tagScore.toFixed(0)}  Shared tags: ${tagDetails.join(', ')}`)
  }

  // 3. Same author
  const targetAuthors = new Set(target.authors)
  const sharedAuthors = candidate.authors.filter(a => targetAuthors.has(a))
  if (sharedAuthors.length > 0) {
    score += 15
    breakdown.push(`+15  Same author: ${sharedAuthors.join(', ')}`)
  }

  // 4. Same type bonus (smaller, excludes note/evergreen)
  if (target.type === candidate.type && !['note', 'evergreen'].includes(target.type)) {
    score += 3
    breakdown.push(`+3   Same type: ${target.type}`)
  }

  return { score, breakdown }
}

// ============================================================================
// Mentions API
// ============================================================================

async function fetchMentions(title: string, slug: string): Promise<Mention[]> {
  if (title.length < 3) return []

  try {
    const url = `${MENTIONS_API}?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
    if (!response.ok) return []
    return (await response.json()) as Mention[]
  } catch {
    return []
  }
}

// ============================================================================
// Output Formatting
// ============================================================================

function printResults(
  target: Note,
  scoredNotes: ScoredNote[],
  mentions: Mention[],
  limit: number
): void {
  console.log()
  console.log('='.repeat(60))
  console.log(` RELATED NOTES for: ${target.slug}`)
  console.log('='.repeat(60))
  console.log()

  if (scoredNotes.length === 0) {
    console.log('No related notes found above the score threshold.')
    console.log()
    return
  }

  console.log(`Found ${scoredNotes.length} related notes (sorted by relevance):`)
  console.log()

  for (let i = 0; i < Math.min(limit, scoredNotes.length); i++) {
    const scored = scoredNotes[i]!
    const note = scored.note
    console.log('-'.repeat(60))
    console.log(`${i + 1}. [[${note.slug}]] - score: ${scored.score.toFixed(0)}`)
    console.log('-'.repeat(60))
    console.log(`   Type: ${note.type} | Authors: ${note.authors.join(', ') || 'none'}`)
    console.log(`   Tags: ${note.tags.join(', ') || 'none'}`)
    console.log()
    console.log('   Score breakdown:')
    for (const line of scored.breakdown) {
      console.log(`     ${line}`)
    }
    console.log()
  }

  // Mentions section
  if (mentions.length > 0) {
    console.log()
    console.log('-'.repeat(60))
    console.log(`MENTIONS (unlinked references to "${target.title}"):`)
    console.log('-'.repeat(60))
    for (const mention of mentions.slice(0, 5)) {
      const snippet = (mention.snippet || '').slice(0, 60)
      console.log(`  [[${mention.slug}]] - "${snippet}..."`)
    }
    console.log()
  }

  console.log('='.repeat(60))
  console.log()
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      limit: { type: 'string', short: 'l', default: '10' },
      'min-score': { type: 'string', short: 'm', default: '5' },
      'no-mentions': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })

  if (values.help || positionals.length === 0) {
    console.log(`
Usage: npx tsx find-related-notes.ts <file> [options]

Arguments:
  file              Path to the note file

Options:
  -l, --limit N     Max suggestions (default: 10)
  -m, --min-score N Minimum score threshold (default: 5)
  --no-mentions     Skip mentions API
  -h, --help        Show this help
`)
    process.exit(values.help ? 0 : 1)
  }

  const filepath = resolve(process.cwd(), positionals[0]!)
  const limit = Number.parseInt(values.limit || '10', 10)
  const minScore = Number.parseFloat(values['min-score'] || '5')
  const skipMentions = values['no-mentions']

  // Validate input file
  try {
    statSync(filepath)
  } catch {
    console.error(`Error: File not found: ${filepath}`)
    process.exit(1)
  }

  // Parse target note
  const target = parseFrontmatter(filepath)
  if (!target) {
    console.error(`Error: Could not parse frontmatter from ${filepath}`)
    process.exit(1)
  }

  // Load embeddings
  const embeddingsData = loadEmbeddings()
  if (!embeddingsData) {
    process.exit(1)
  }

  // Get all notes
  const allNotes = getAllNotes()
  if (allNotes.length === 0) {
    console.error('Error: No notes found in content directory')
    process.exit(1)
  }

  // Filter out the target note
  const candidateNotes = allNotes.filter(n => n.slug !== target.slug)

  // Check if target has an embedding
  const targetEmbedding = embeddingsData.embeddings[target.slug]?.vector
  if (!targetEmbedding) {
    console.error(`Error: No embedding found for ${target.slug}`)
    console.error(`Run 'pnpm generate:embeddings' to update embeddings`)
    process.exit(1)
  }

  // Compute tag frequencies
  const tagFreq = computeTagFrequencies(allNotes)

  // Score all candidates
  const scored: ScoredNote[] = []
  for (const candidate of candidateNotes) {
    const candidateEmbedding = embeddingsData.embeddings[candidate.slug]?.vector
    if (!candidateEmbedding) continue

    const { score, breakdown } = computeScore(
      target,
      candidate,
      targetEmbedding,
      candidateEmbedding,
      tagFreq
    )

    if (score >= minScore) {
      scored.push({ note: candidate, score, breakdown })
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Fetch mentions
  let mentions: Mention[] = []
  if (!skipMentions) {
    mentions = await fetchMentions(target.title, target.slug)
  }

  // Print results
  printResults(target, scored, mentions, limit)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
