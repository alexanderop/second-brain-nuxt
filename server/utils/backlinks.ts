/**
 * Pure functions for building backlinks index from content items.
 * Extracted from server/api/backlinks.get.ts for testability.
 */

import { extractLinksFromBody } from './minimark'
import { getSlug, type ContentItem } from './graph'

export interface BacklinkItem {
  slug: string
  title: string
  type: string
}

export interface BacklinksIndex {
  [targetSlug: string]: BacklinkItem[]
}

/**
 * Build metadata map from content for quick lookups
 */
export function buildContentMap(allContent: ContentItem[]): Map<string, { title: string, type: string }> {
  const contentMap = new Map<string, { title: string, type: string }>()
  for (const item of allContent) {
    const slug = getSlug(item)
    contentMap.set(slug, {
      title: item.title || slug,
      type: item.type || 'note',
    })
  }
  return contentMap
}

/**
 * Add backlinks for a single source item (mutates backlinksIndex)
 */
export function addBacklinksForItem(
  item: ContentItem,
  sourceMeta: { title: string, type: string },
  sourceSlug: string,
  backlinksIndex: BacklinksIndex,
): void {
  const links = extractLinksFromBody(item.body)
  const uniqueLinks = [...new Set(links)]

  for (const targetSlug of uniqueLinks) {
    if (targetSlug === sourceSlug) continue

    if (!backlinksIndex[targetSlug]) {
      backlinksIndex[targetSlug] = []
    }

    backlinksIndex[targetSlug].push({
      slug: sourceSlug,
      title: sourceMeta.title,
      type: sourceMeta.type,
    })
  }
}

/**
 * Build complete backlinks index from content items.
 * Maps each slug to an array of items that link to it.
 */
export function buildBacklinksIndex(allContent: ContentItem[]): BacklinksIndex {
  const backlinksIndex: BacklinksIndex = {}

  for (const item of allContent) {
    const sourceSlug = getSlug(item)
    const sourceMeta = {
      title: item.title || sourceSlug,
      type: item.type || 'note',
    }
    addBacklinksForItem(item, sourceMeta, sourceSlug, backlinksIndex)
  }

  return backlinksIndex
}
