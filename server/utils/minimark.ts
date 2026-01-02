// Minimark node type: [tag, props, ...children]
export type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]

// Helper: Check if href is an internal link
function isInternalLink(href: unknown): href is string {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')
}

// Helper: Extract slug from internal href
function extractSlugFromHref(href: string): string | null {
  const slugParts = href.slice(1).split('#')[0]?.split('?')[0]
  return slugParts || null
}

// Helper: Extract link from anchor node if valid
function extractLinkFromAnchor(props: Record<string, unknown>): string | null {
  if (!isInternalLink(props.href)) return null
  return extractSlugFromHref(props.href)
}

/**
 * Extract internal links from a minimark AST node.
 * Minimark uses arrays: [tag, props, ...children] instead of objects.
 */
export function extractLinksFromMinimark(node: unknown): string[] {
  if (!node || !Array.isArray(node) || node.length < 2) return []

  const [tag, props, ...children] = node
  const links: string[] = []

  if (tag === 'a' && typeof props === 'object' && props !== null) {
    const slug = extractLinkFromAnchor(props)
    if (slug) links.push(slug)
  }

  for (const child of children) {
    links.push(...extractLinksFromMinimark(child))
  }

  return links
}

/**
 * Extract links from a body object which contains minimark value array.
 * Body format: { type: 'minimark', value: [...nodes] }
 */
interface MinimarkBody {
  type?: string
  value?: unknown[]
}

export function extractLinksFromBody(body: unknown): string[] {
  const links: string[] = []

  if (!body || typeof body !== 'object') return links

  const b: MinimarkBody = body

  // Handle minimark format: { type: 'minimark', value: [...nodes] }
  if (b.type === 'minimark' && Array.isArray(b.value)) {
    for (const node of b.value) {
      links.push(...extractLinksFromMinimark(node))
    }
  }

  return links
}
