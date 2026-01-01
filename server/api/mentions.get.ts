import { queryCollection, queryCollectionSearchSections } from '@nuxt/content/server'

interface MentionItem {
  slug: string
  title: string
  type: string
  snippet: string
  highlightedSnippet: string
}

// Minimark node type: [tag, props, ...children]
type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]

// Extract internal links from minimark body format
// Minimark uses arrays: [tag, props, ...children] instead of objects
function extractLinksFromMinimark(node: unknown): Array<string> {
  const links: Array<string> = []

  if (!node) return links

  // Handle minimark node format: [tag, props, ...children]
  if (Array.isArray(node)) {
    const [tag, props, ...children] = node as MinimarkNode

    // Check if this is an anchor tag with internal href
    if (tag === 'a' && typeof props === 'object' && props !== null) {
      const href = props.href
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        // Extract slug from href (remove leading slash)
        const slugParts = href.slice(1).split('#')[0]?.split('?')[0]
        if (slugParts) {
          links.push(slugParts)
        }
      }
    }

    // Recursively process children
    for (const child of children) {
      links.push(...extractLinksFromMinimark(child))
    }
  }

  return links
}

// Extract links from the body object which contains minimark value array
function extractLinksFromBody(body: unknown): Array<string> {
  const links: Array<string> = []

  if (!body || typeof body !== 'object') return links

  const b = body as { type?: string, value?: unknown[] }

  // Handle minimark format: { type: 'minimark', value: [...nodes] }
  if (b.type === 'minimark' && Array.isArray(b.value)) {
    for (const node of b.value) {
      links.push(...extractLinksFromMinimark(node))
    }
  }

  return links
}

// Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Extract snippet around match with context
function getSnippet(content: string, term: string, contextChars = 60): string {
  const lowerContent = content.toLowerCase()
  const lowerTerm = term.toLowerCase()
  const index = lowerContent.indexOf(lowerTerm)

  if (index === -1) return content.slice(0, 150)

  const start = Math.max(0, index - contextChars)
  const end = Math.min(content.length, index + term.length + contextChars)

  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet += '...'

  return snippet
}

// Highlight matched terms in text
function highlightMatch(text: string, term: string): string {
  if (!term) return text
  const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
  return text.replace(regex, '<mark class="bg-[var(--ui-primary)]/20 text-[var(--ui-primary)] rounded px-0.5">$1</mark>')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetSlug = query.slug as string
  const targetTitle = query.title as string

  if (!targetSlug || !targetTitle) {
    return []
  }

  // Skip very short titles to avoid false positives
  if (targetTitle.length < 3) {
    return []
  }

  try {
    // Get all content with body for link extraction
    const allContent = await queryCollection(event, 'content').all()

    // Get search sections for plain text content
    const searchSections = await queryCollectionSearchSections(event, 'content')

    // Build a map of slug -> content metadata and outgoing links
    const contentMap = new Map<string, {
      title: string
      type: string
      linksTo: Set<string>
    }>()

    for (const item of allContent) {
      const slug = item.path?.slice(1) || item.stem || ''
      const links = extractLinksFromBody(item.body)
      contentMap.set(slug, {
        title: item.title || slug,
        type: item.type || 'note',
        linksTo: new Set(links),
      })
    }

    // Create case-insensitive regex for title matching
    // Use word boundaries to avoid partial matches
    const titleRegex = new RegExp(`\\b${escapeRegex(targetTitle)}\\b`, 'i')

    // Group sections by document path
    const mentionsByPath = new Map<string, { content: string, sectionTitle: string }>()

    for (const section of searchSections) {
      // Extract path from section id (e.g., "/atomic-habits#section" -> "atomic-habits")
      const path = section.id.split('#')[0]?.slice(1) || ''

      // Skip self-references
      if (path === targetSlug) continue

      // Check if this note already has an explicit link to target
      const contentMeta = contentMap.get(path)
      if (contentMeta?.linksTo.has(targetSlug)) continue

      // Check if content contains the title
      if (section.content && titleRegex.test(section.content)) {
        // Only keep the first match per document
        if (!mentionsByPath.has(path)) {
          mentionsByPath.set(path, {
            content: section.content,
            sectionTitle: section.titles?.[0] || section.title || path,
          })
        }
      }
    }

    // Build the response
    const mentions: MentionItem[] = []

    for (const [path, data] of mentionsByPath) {
      const contentMeta = contentMap.get(path)
      if (!contentMeta) continue

      const snippet = getSnippet(data.content, targetTitle)
      const highlightedSnippet = highlightMatch(snippet, targetTitle)

      mentions.push({
        slug: path,
        title: contentMeta.title,
        type: contentMeta.type,
        snippet,
        highlightedSnippet,
      })
    }

    return mentions
  }
  catch (error) {
    console.error('Error finding unlinked mentions:', error)
    return []
  }
})
