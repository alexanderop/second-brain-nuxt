// oxlint-disable eslint/no-console
/**
 * Build script to generate embeddings for semantic search
 *
 * Uses Transformers.js with bge-small-en-v1.5 to generate 384-dimension
 * embeddings from content (title + summary + first 512 chars of body).
 * Outputs to public/embeddings.json for client-side semantic search.
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { pipeline } from '@huggingface/transformers'

const CONTENT_DIR = join(process.cwd(), 'content')
const OUTPUT_PATH = join(process.cwd(), 'public', 'embeddings.json')

// Use bge-small-en-v1.5 for 384-dimension embeddings
const MODEL_NAME = 'Xenova/bge-small-en-v1.5'
const EMBEDDING_VERSION = '1.0.0'

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
}

interface EmbeddingsOutput {
  version: string
  model: string
  embeddings: Record<string, EmbeddingEntry>
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): Frontmatter {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return {}

  const frontmatter: Frontmatter = {}
  const lines = frontmatterMatch[1].split('\n')

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '')
      if (key === 'title') frontmatter.title = cleanValue
      if (key === 'type') frontmatter.type = cleanValue
      if (key === 'summary') frontmatter.summary = cleanValue
    }
  }

  return frontmatter
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

  // Take first 512 chars of body
  if (body) {
    const truncatedBody = body.slice(0, 512)
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

async function main() {
  console.log('Generating embeddings for semantic search...')
  console.log(`Model: ${MODEL_NAME}`)

  // Ensure public directory exists
  await mkdir(join(process.cwd(), 'public'), { recursive: true })

  // Initialize the embedding pipeline
  console.log('Loading embedding model...')
  const extractor = await pipeline('feature-extraction', MODEL_NAME, {
    dtype: 'fp32',
  })
  console.log('Model loaded!')

  // Find all markdown files
  const files = await findMarkdownFiles(CONTENT_DIR)
  console.log(`Found ${files.length} content file(s)`)

  const embeddings: Record<string, EmbeddingEntry> = {}
  let processed = 0
  let skipped = 0
  let errors = 0

  for (const filePath of files) {
    const slug = getSlugFromPath(filePath)

    const content = await readFile(filePath, 'utf-8').catch((error) => {
      console.error(`  Error reading ${slug}:`, error)
      errors++
      return null
    })
    if (!content) continue

    const frontmatter = parseFrontmatter(content)

    if (!frontmatter.title) {
      console.log(`  Skipping ${slug}: no title`)
      skipped++
      continue
    }

    const body = extractBody(content)
    const text = createEmbeddingText(frontmatter, body)

    // Generate embedding
    const output = await extractor(text, { pooling: 'mean', normalize: true })

    // Convert to plain array - output.data is typed as DataArray (Float32Array | etc.)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Transformers.js returns Float32Array for fp32
    const vector = Array.from(output.data as Float32Array)

    embeddings[slug] = {
      vector,
      title: frontmatter.title,
      type: frontmatter.type || 'note',
    }

    processed++

    if (processed % 50 === 0) {
      console.log(`  Processed ${processed} files...`)
    }
  }

  // Write output
  const output: EmbeddingsOutput = {
    version: EMBEDDING_VERSION,
    model: MODEL_NAME,
    embeddings,
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output))
  console.log(`\nDone! Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`)
  console.log(`Output: ${OUTPUT_PATH}`)
}

main().catch(console.error)
