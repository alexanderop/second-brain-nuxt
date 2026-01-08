 
// oxlint-disable eslint/no-console
/**
 * Build script to copy Obsidian auto-exported SVGs to public folder
 *
 * Obsidian's Excalidraw plugin auto-exports SVGs alongside .excalidraw.md files.
 * This script copies them to public/excalidraw/ for serving.
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'

const CONTENT_DIR = join(process.cwd(), 'content', 'Excalidraw')
const OUTPUT_DIR = join(process.cwd(), 'public', 'excalidraw')

/**
 * Generate a URL-friendly slug from filename
 */
function slugify(filename: string): string {
  return basename(filename, '.svg')
    .replace(/\.excalidraw$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

/**
 * Process SVG for theming:
 * - Make background transparent (remove white rect)
 * - Dark mode is handled via CSS filter: invert()
 */
function processSvg(svg: string): string {
  return svg
    // Remove white background rect (first rect with fill="#ffffff")
    .replace(/<rect x="0" y="0"[^>]*fill="#ffffff"[^>]*><\/rect>/i, '')
}

async function main() {
  console.log('Processing Excalidraw SVGs...')

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true })

  // Find all .svg files (auto-exported by Obsidian)
  let files: string[]
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.svg'))
  } catch {
    console.log('No Excalidraw directory found, skipping.')
    return
  }

  if (files.length === 0) {
    console.log('No SVG files found. Enable auto-export in Obsidian Excalidraw settings.')
    return
  }

  console.log(`Found ${files.length} SVG file(s)`)

  for (const file of files) {
    const inputPath = join(CONTENT_DIR, file)
    const slug = slugify(file)
    const outputPath = join(OUTPUT_DIR, `${slug}.svg`)

    console.log(`  Processing: ${file} -> ${slug}.svg`)

    try {
      const content = await readFile(inputPath, 'utf-8')
      const processed = processSvg(content)
      await writeFile(outputPath, processed)
    } catch (error) {
      console.error(`    Error processing ${file}:`, error)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
