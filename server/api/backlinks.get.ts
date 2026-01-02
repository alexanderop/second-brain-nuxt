import { queryCollection } from '@nuxt/content/server'
import { extractLinksFromBody } from '../utils/minimark'

interface BacklinkItem {
  slug: string
  title: string
  type: string
}

interface BacklinksIndex {
  [targetSlug: string]: Array<BacklinkItem>
}

interface ContentItem {
  path?: string
  stem?: string
  title?: string
  type?: string
  body?: unknown
}

// Helper: Extract slug from content item
function getSlug(item: ContentItem): string {
  return item.path?.slice(1) || item.stem || ''
}

// Helper: Build metadata map from content
function buildContentMap(allContent: ContentItem[]): Map<string, { title: string, type: string }> {
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

// Helper: Add backlinks for a single source item
function addBacklinksForItem(
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

export default defineEventHandler(async (event) => {
  const backlinksIndex: BacklinksIndex = {}

  try {
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'summary', 'body')
      .all()

    const contentMap = buildContentMap(allContent)

    for (const item of allContent) {
      const sourceSlug = getSlug(item)
      const sourceMeta = contentMap.get(sourceSlug)
      if (sourceMeta) {
        addBacklinksForItem(item, sourceMeta, sourceSlug, backlinksIndex)
      }
    }

    return backlinksIndex
  }
  catch (error) {
    console.error('Error building backlinks index:', error)
    return {}
  }
})
