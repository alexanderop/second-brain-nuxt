import { queryCollection, queryCollectionSearchSections } from '@nuxt/content/server'
import { extractLinksFromBody } from '../utils/minimark'
import { escapeRegex, getSnippet, highlightMatch } from '../utils/text'

interface MentionItem {
  slug: string
  title: string
  type: string
  snippet: string
  highlightedSnippet: string
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
