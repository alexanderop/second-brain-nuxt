/**
 * Pure functions for finding unlinked mentions in content.
 * Extracted from server/api/mentions.get.ts for testability.
 */

import { extractLinksFromBody } from './minimark'
import { escapeRegex, getSnippet, highlightMatch } from './text'
import { getSlug, type ContentItem } from './graph'

export interface MentionItem {
  slug: string
  title: string
  type: string
  snippet: string
  highlightedSnippet: string
}

export interface ContentMeta {
  title: string
  type: string
  linksTo: Set<string>
}

export interface SearchSection {
  id: string
  content?: string
  titles?: string[]
  title?: string
}

/**
 * Build content metadata map including links
 */
export function buildContentMapWithLinks(allContent: ContentItem[]): Map<string, ContentMeta> {
  const contentMap = new Map<string, ContentMeta>()
  for (const item of allContent) {
    const slug = getSlug(item)
    const links = extractLinksFromBody(item.body)
    contentMap.set(slug, {
      title: item.title || slug,
      type: item.type || 'note',
      linksTo: new Set(links),
    })
  }
  return contentMap
}

/**
 * Extract slug from section ID (handles both "/slug#section" and "slug#section")
 */
export function extractSlugFromSectionId(sectionId: string): string {
  const rawPath = sectionId.split('#')[0] || ''
  return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath
}

/**
 * Check if section should be included as a mention
 */
export function shouldIncludeSection(
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

/**
 * Build mentions map from sections
 */
export function buildMentionsMap(
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

/**
 * Convert mentions map to response array
 */
export function buildMentionItems(
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

/**
 * Find unlinked mentions for a target note.
 * This is the main entry point for mention detection.
 */
export function findUnlinkedMentions(
  allContent: ContentItem[],
  searchSections: SearchSection[],
  targetSlug: string,
  targetTitle: string,
): MentionItem[] {
  if (!targetSlug || !targetTitle || targetTitle.length < 3) {
    return []
  }

  const contentMap = buildContentMapWithLinks(allContent)
  const titleRegex = new RegExp(`\\b${escapeRegex(targetTitle)}\\b`, 'i')
  const mentionsByPath = buildMentionsMap(searchSections, targetSlug, contentMap, titleRegex)

  return buildMentionItems(mentionsByPath, contentMap, targetTitle)
}
