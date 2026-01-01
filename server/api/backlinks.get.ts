import { queryCollection } from '@nuxt/content/server'

interface BacklinkItem {
  slug: string
  title: string
  type: string
}

interface BacklinksIndex {
  [targetSlug: string]: Array<BacklinkItem>
}

// Recursively extract internal links from AST body
function extractLinksFromAst(node: unknown): Array<string> {
  const links: Array<string> = []

  if (!node || typeof node !== 'object') return links

  const n = node as Record<string, unknown>

  // Check if this is a link element with internal href
  if (n.tag === 'a' && typeof n.props === 'object' && n.props !== null) {
    const props = n.props as Record<string, unknown>
    const href = props.href
    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
      // Extract slug from href (remove leading slash)
      const slugParts = href.slice(1).split('#')[0]?.split('?')[0]
      if (slugParts) {
        links.push(slugParts)
      }
    }
  }

  // Recursively check children
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      links.push(...extractLinksFromAst(child))
    }
  }

  // Also check body if it exists (for root content object)
  if (n.body && typeof n.body === 'object') {
    links.push(...extractLinksFromAst(n.body))
  }

  return links
}

export default defineEventHandler(async (event) => {
  const backlinksIndex: BacklinksIndex = {}

  try {
    // Query all content from the database using auto-imported queryCollection
    const allContent = await queryCollection(event, 'content').all()

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

      // Extract links from the parsed body AST
      const links = extractLinksFromAst(item.body)
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
