// oxlint-disable eslint/no-console
/**
 * Build script to generate embeddings for semantic search
 *
 * Uses Transformers.js with bge-small-en-v1.5 to generate 384-dimension
 * embeddings from content (title + summary + first 1500 chars of body).
 * Outputs to public/embeddings.json for client-side semantic search.
 *
 * Features:
 * - Incremental generation via content hashing (skips unchanged files)
 * - Batch processing for better throughput
 * - Reduced precision for smaller output (~40% size reduction)
 */

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'
import { parse as parseYaml } from 'yaml'
import { tryCatch } from '../shared/utils/tryCatch'

const CONTENT_DIR = join(process.cwd(), 'content')
const OUTPUT_PATH = join(process.cwd(), 'public', 'embeddings.json')

// Use bge-small-en-v1.5 for 384-dimension embeddings
const MODEL_NAME = 'Xenova/bge-small-en-v1.5'
const EMBEDDING_VERSION = '1.1.0'

// Processing configuration
const BATCH_SIZE = 16
const TEXT_MAX_LENGTH = 1500
const VECTOR_SIZE = 384

// Excluded directories that don't need embeddings
const EXCLUDED_DIRS = [
  'authors',
  'pages',
  'podcasts',
  'tweets',
  'newsletters',
  'Readwise',
  'blog',
  'Excalidraw',
  'newsletter-drafts',
  'blog-ideas',
  '_obsidian-templates',
  'private',
]

interface Frontmatter {
  title?: string
  type?: string
  summary?: string
}

interface EmbeddingEntry {
  vector: number[]
  title: string
  type: string
  hash: string
}

interface EmbeddingsOutput {
  version: string
  model: string
  generatedAt: string
  textMaxLength: number
  embeddings: Record<string, EmbeddingEntry>
}

interface FileToProcess {
  slug: string
  text: string
  title: string
  type: string
  hash: string
}

interface ProcessingStats {
  cached: number
  skipped: number
  errors: number
}

/**
 * Create a short hash of content for change detection
 */
function hashContent(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}

/**
 * Parse frontmatter from markdown content using YAML parser
 */
function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const [parseError, parsed] = tryCatch(() => parseYaml(match[1]))
  if (parseError || typeof parsed !== 'object' || parsed === null) return {}

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- YAML parser returns unknown, we validate object above
  return parsed as Frontmatter
}

/**
 * Extract body content after frontmatter, removing markdown syntax
 */
function extractBody(content: string): string {
  // Remove frontmatter
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '')

  // Remove markdown syntax for cleaner text
  return body
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
    .replace(/^\s*[-*+]\s+/gm, '') // List items
    .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
    .replace(/>\s+/g, '') // Blockquotes
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines
    .trim()
}

/**
 * Create embedding text from title, summary, and body
 */
function createEmbeddingText(frontmatter: Frontmatter, body: string): string {
  const parts: string[] = []

  if (frontmatter.title) {
    parts.push(frontmatter.title)
  }

  if (frontmatter.summary) {
    parts.push(frontmatter.summary)
  }

  // Take first TEXT_MAX_LENGTH chars of body
  if (body) {
    const truncatedBody = body.slice(0, TEXT_MAX_LENGTH)
    parts.push(truncatedBody)
  }

  return parts.join(' ')
}

/**
 * Recursively find all markdown files in directory
 */
async function findMarkdownFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDED_DIRS.includes(entry.name)) {
        await findMarkdownFiles(fullPath, files)
      }
      continue
    }

    if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Get slug from file path
 */
function getSlugFromPath(filePath: string): string {
  const relativePath = filePath.replace(CONTENT_DIR + '/', '')
  return basename(relativePath, '.md')
}

/**
 * Load existing embeddings file if it exists
 */
async function loadExistingEmbeddings(): Promise<EmbeddingsOutput | null> {
  if (!existsSync(OUTPUT_PATH)) return null

  const content = await readFile(OUTPUT_PATH, 'utf-8').catch(() => null)
  if (!content) return null

  const [parseError, parsed] = tryCatch(() => JSON.parse(content))
  if (parseError) return null

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- JSON.parse returns unknown, structure validated by usage
  return parsed as EmbeddingsOutput
}

/**
 * Round vector values to 5 decimal places for smaller output
 */
function roundVector(vector: Float32Array): number[] {
  return Array.from(vector).map((v) => Math.round(v * 100000) / 100000)
}

/**
 * Process a single file and determine if it needs embedding generation
 */
async function processFile(
  filePath: string,
  existingOutput: EmbeddingsOutput | null,
  embeddings: Record<string, EmbeddingEntry>,
  toProcess: FileToProcess[],
  stats: ProcessingStats,
): Promise<void> {
  const slug = getSlugFromPath(filePath)

  const content = await readFile(filePath, 'utf-8').catch((error) => {
    console.error(`  Error reading ${slug}:`, error)
    stats.errors++
    return null
  })
  if (!content) return

  const frontmatter = parseFrontmatter(content)

  if (!frontmatter.title) {
    console.log(`  Skipping ${slug}: no title`)
    stats.skipped++
    return
  }

  const body = extractBody(content)
  const text = createEmbeddingText(frontmatter, body)
  const contentHash = hashContent(text)

  // Check if we can reuse existing embedding
  const existing = existingOutput?.embeddings[slug]
  if (existing?.hash === contentHash) {
    embeddings[slug] = existing
    stats.cached++
    console.log(`[cached] ${slug}`)
    return
  }

  toProcess.push({
    slug,
    text,
    title: frontmatter.title,
    type: frontmatter.type || 'note',
    hash: contentHash,
  })
}

/**
 * Process a batch of files and generate embeddings
 */
async function processBatch(
  batch: FileToProcess[],
  extractor: FeatureExtractionPipeline,
  embeddings: Record<string, EmbeddingEntry>,
): Promise<void> {
  const texts = batch.map((item) => item.text)

  // Generate embeddings for batch
  const outputs = await extractor(texts, { pooling: 'mean', normalize: true })

  // Handle batch results
  for (let j = 0; j < batch.length; j++) {
    const item = batch[j]
    if (!item) continue

    // For batched input, outputs.data contains all vectors concatenated
    const start = j * VECTOR_SIZE
    const end = start + VECTOR_SIZE
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Transformers.js returns Float32Array for fp32
    const vectorData = (outputs.data as Float32Array).slice(start, end)
    const vector = roundVector(vectorData)

    embeddings[item.slug] = {
      vector,
      title: item.title,
      type: item.type,
      hash: item.hash,
    }

    console.log(`[generated] ${item.slug}`)
  }
}

async function main() {
  const startTime = Date.now()
  console.log('Generating embeddings for semantic search...')
  console.log(`Model: ${MODEL_NAME}`)

  // Ensure public directory exists
  await mkdir(join(process.cwd(), 'public'), { recursive: true })

  // Load existing embeddings for incremental generation
  const existingOutput = await loadExistingEmbeddings()
  if (existingOutput) {
    console.log('Found existing embeddings, will use incremental generation')
  }

  // Initialize the embedding pipeline
  console.log('Loading embedding model...')
  const extractor = await pipeline('feature-extraction', MODEL_NAME, {
    dtype: 'fp32',
  })
  console.log('Model loaded!')

  // Find all markdown files
  const files = await findMarkdownFiles(CONTENT_DIR)
  console.log(`Found ${files.length} content file(s)\n`)

  const embeddings: Record<string, EmbeddingEntry> = {}
  const toProcess: FileToProcess[] = []
  const stats: ProcessingStats = { cached: 0, skipped: 0, errors: 0 }

  // First pass: identify files needing processing
  for (const filePath of files) {
    await processFile(filePath, existingOutput, embeddings, toProcess, stats)
  }

  console.log(`\nTo process: ${toProcess.length}, Cached: ${stats.cached}, Skipped: ${stats.skipped}`)

  // Process files in batches
  if (toProcess.length > 0) {
    console.log(`\nProcessing ${toProcess.length} file(s) in batches of ${BATCH_SIZE}...`)

    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
      const batch = toProcess.slice(i, i + BATCH_SIZE)
      await processBatch(batch, extractor, embeddings)

      const progress = Math.min(i + BATCH_SIZE, toProcess.length)
      console.log(`  Progress: ${progress}/${toProcess.length}`)
    }
  }

  // Write output with metadata
  const output: EmbeddingsOutput = {
    version: EMBEDDING_VERSION,
    model: MODEL_NAME,
    generatedAt: new Date().toISOString(),
    textMaxLength: TEXT_MAX_LENGTH,
    embeddings,
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output))

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\nDone in ${duration}s!`)
  console.log(`  Generated: ${toProcess.length}, Cached: ${stats.cached}, Skipped: ${stats.skipped}, Errors: ${stats.errors}`)
  console.log(`  Output: ${OUTPUT_PATH}`)
}

main().catch(console.error)
