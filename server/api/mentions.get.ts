import { defineEventHandler, getQuery } from 'h3'
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

interface ContentMeta {
  title: string
  type: string
  linksTo: Set<string>
}

interface ContentItem {
  path?: string
  stem?: string
  title?: string
  type?: string
  body?: unknown
}

interface SearchSection {
  id: string
  content?: string
  titles?: string[]
  title?: string
}

// Helper: Build content metadata map
function buildContentMap(allContent: ContentItem[]): Map<string, ContentMeta> {
  const contentMap = new Map<string, ContentMeta>()
  for (const item of allContent) {
    const slug = item.path?.slice(1) || item.stem || ''
    const links = extractLinksFromBody(item.body)
    contentMap.set(slug, {
      title: item.title || slug,
      type: item.type || 'note',
      linksTo: new Set(links),
    })
  }
  return contentMap
}

// Helper: Extract slug from section ID (handles both "/slug#section" and "slug#section")
function extractSlugFromSectionId(sectionId: string): string {
  const rawPath = sectionId.split('#')[0] || ''
  return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath
}

// Helper: Check if section should be included as a mention
function shouldIncludeSection(
  section: SearchSection,
  targetSlug: string,
  contentMap: Map<string, ContentMeta>,
  titleRegex: RegExp,
): boolean {
  const path = extractSlugFromSectionId(section.id)
  if (path === targetSlug) return false

  const contentMeta = contentMap.get(path)
  if (contentMeta?.linksTo.has(targetSlug)) return false

  return Boolean(section.content && titleRegex.test(section.content))
}

// Helper: Build mentions map from sections
function buildMentionsMap(
  searchSections: SearchSection[],
  targetSlug: string,
  contentMap: Map<string, ContentMeta>,
  titleRegex: RegExp,
): Map<string, { content: string, sectionTitle: string }> {
  const mentionsByPath = new Map<string, { content: string, sectionTitle: string }>()

  for (const section of searchSections) {
    const path = extractSlugFromSectionId(section.id)
    if (mentionsByPath.has(path)) continue
    if (!shouldIncludeSection(section, targetSlug, contentMap, titleRegex)) continue

    mentionsByPath.set(path, {
      content: section.content || '',
      sectionTitle: section.titles?.[0] || section.title || path,
    })
  }

  return mentionsByPath
}

// Helper: Convert mentions map to response array
function buildMentionItems(
  mentionsByPath: Map<string, { content: string }>,
  contentMap: Map<string, ContentMeta>,
  targetTitle: string,
): MentionItem[] {
  const mentions: MentionItem[] = []

  for (const [path, data] of mentionsByPath) {
    const contentMeta = contentMap.get(path)
    if (!contentMeta) continue

    const snippet = getSnippet(data.content, targetTitle)
    mentions.push({
      slug: path,
      title: contentMeta.title,
      type: contentMeta.type,
      snippet,
      highlightedSnippet: highlightMatch(snippet, targetTitle),
    })
  }

  return mentions
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetSlug = String(query.slug || '')
  const targetTitle = String(query.title || '')

  if (!targetSlug || !targetTitle || targetTitle.length < 3) {
    return []
  }

  try {
    const allContent = await queryCollection(event, 'content').all()
    const searchSections = await queryCollectionSearchSections(event, 'content')

    const contentMap = buildContentMap(allContent)
    const titleRegex = new RegExp(`\\b${escapeRegex(targetTitle)}\\b`, 'i')
    const mentionsByPath = buildMentionsMap(searchSections, targetSlug, contentMap, titleRegex)

    return buildMentionItems(mentionsByPath, contentMap, targetTitle)
  }
  catch (error) {
    console.error('Error finding unlinked mentions:', error)
    return []
  }
})
