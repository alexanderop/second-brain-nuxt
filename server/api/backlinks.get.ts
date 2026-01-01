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

export default defineEventHandler(async (event) => {
  const backlinksIndex: BacklinksIndex = {}

  try {
    // Query all content from the database using auto-imported queryCollection
    // Must explicitly select body to get the AST for link extraction
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'summary', 'body')
      .all()

    // Build a map of slug -> metadata for all content
    const contentMap = new Map<string, { title: string, type: string }>()
    for (const item of allContent) {
      const slug = item.path?.slice(1) || item.stem || ''
      contentMap.set(slug, {
        title: item.title || slug,
        type: item.type || 'note',
      })
    }

    // Extract links from each content item and build reverse index
    for (const item of allContent) {
      const sourceSlug = item.path?.slice(1) || item.stem || ''
      const sourceMeta = contentMap.get(sourceSlug)

      if (!sourceMeta) continue

      // Extract links from the parsed body (minimark format)
      const links = extractLinksFromBody(item.body)
      const uniqueLinks = [...new Set(links)]

      for (const targetSlug of uniqueLinks) {
        // Skip self-references
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

    return backlinksIndex
  }
  catch (error) {
    console.error('Error building backlinks index:', error)
    return {}
  }
})
