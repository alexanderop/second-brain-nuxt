// Minimark node type: [tag, props, ...children]
export type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]

// Helper: Check if href is an internal link
function isInternalLink(href: unknown): href is string {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')
}

// Helper: Extract slug from internal href
function extractSlugFromHref(href: string): string | null {
  // Split on # or ? in one pass - first element is always the slug portion
  const slug = href.slice(1).split(/[#?]/)[0]
  return slug || null
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
 * Extract links from a body object.
 * Supports two formats:
 * - Nuxt Content v3: { type: 'root', children: [...nodes] }
 * - Legacy minimark: { type: 'minimark', value: [...nodes] }
 */

// Type guard: check if body has children array (Nuxt Content v3 format)
function hasChildren(body: object): body is { children: unknown[] } {
  return 'children' in body && Array.isArray(body.children)
}

// Type guard: check if body has minimark format
function isMinimarkBody(body: object): body is { type: 'minimark', value: unknown[] } {
  return 'type' in body && body.type === 'minimark' && 'value' in body && Array.isArray(body.value)
}

export function extractLinksFromBody(body: unknown): string[] {
  if (!body || typeof body !== 'object') return []

  // Handle Nuxt Content v3 format: { type: '...', children: [...] }
  if (hasChildren(body)) {
    return body.children.flatMap(node => extractLinksFromMinimark(node))
  }

  // Handle legacy minimark format: { type: 'minimark', value: [...] }
  if (isMinimarkBody(body)) {
    return body.value.flatMap(node => extractLinksFromMinimark(node))
  }

  return []
}
