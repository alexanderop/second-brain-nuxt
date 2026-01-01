// Minimark node type: [tag, props, ...children]
export type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]

/**
 * Extract internal links from a minimark AST node.
 * Minimark uses arrays: [tag, props, ...children] instead of objects.
 */
export function extractLinksFromMinimark(node: unknown): string[] {
  const links: string[] = []

  if (!node) return links

  // Handle minimark node format: [tag, props, ...children]
  if (Array.isArray(node)) {
    const [tag, props, ...children] = node as MinimarkNode

    // Check if this is an anchor tag with internal href
    if (tag === 'a' && typeof props === 'object' && props !== null) {
      const href = props.href
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        // Extract slug from href (remove leading slash, hash, and query params)
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

/**
 * Extract links from a body object which contains minimark value array.
 * Body format: { type: 'minimark', value: [...nodes] }
 */
export function extractLinksFromBody(body: unknown): string[] {
  const links: string[] = []

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
