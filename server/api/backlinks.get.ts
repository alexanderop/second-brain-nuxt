import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

interface BacklinkItem {
  slug: string
  title: string
  type: string
}

interface BacklinksIndex {
  [targetSlug: string]: Array<BacklinkItem>
}

// Extract wiki-links from markdown content
function extractWikiLinks(content: string): Array<string> {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  const links: Array<string> = []

  for (const match of content.matchAll(wikiLinkRegex)) {
    if (match[1]) {
      const slug = match[1].toLowerCase().replace(/\s+/g, '-')
      links.push(slug)
    }
  }

  return [...new Set(links)] // Remove duplicates
}

// Parse frontmatter from markdown file
function parseFrontmatter(content: string): { title: string, type: string } | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch || !frontmatterMatch[1])
    return null

  const frontmatter = frontmatterMatch[1]
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/)
  const typeMatch = frontmatter.match(/type:\s*(\w+)/)

  return {
    title: titleMatch?.[1] ?? 'Untitled',
    type: typeMatch?.[1] ?? 'note',
  }
}

export default defineEventHandler(async () => {
  const contentDir = join(process.cwd(), 'content')
  const backlinksIndex: BacklinksIndex = {}

  try {
    const files = await readdir(contentDir)
    const mdFiles = files.filter((f: string) => f.endsWith('.md'))

    // First pass: parse all files to get metadata
    const fileData: Map<string, { content: string, title: string, type: string }> = new Map()

    for (const file of mdFiles) {
      const filePath = join(contentDir, file)
      const content = await readFile(filePath, 'utf-8')
      const slug = file.replace(/\.md$/, '')
      const meta = parseFrontmatter(content)

      fileData.set(slug, {
        content,
        title: meta?.title ?? slug,
        type: meta?.type ?? 'note',
      })
    }

    // Second pass: extract links and build reverse index
    for (const [sourceSlug, data] of fileData) {
      const links = extractWikiLinks(data.content)

      for (const targetSlug of links) {
        if (!backlinksIndex[targetSlug]) {
          backlinksIndex[targetSlug] = []
        }

        // Don't add self-references
        if (targetSlug !== sourceSlug) {
          backlinksIndex[targetSlug].push({
            slug: sourceSlug,
            title: data.title,
            type: data.type,
          })
        }
      }
    }

    return backlinksIndex
  }
  catch (error) {
    console.error('Error building backlinks index:', error)
    return {}
  }
})
