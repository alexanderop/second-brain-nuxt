import { queryCollection } from '@nuxt/content/server'

interface BacklinkItem {
  slug: string
  title: string
  type: string
}

interface BacklinksIndex {
  [targetSlug: string]: Array<BacklinkItem>
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
