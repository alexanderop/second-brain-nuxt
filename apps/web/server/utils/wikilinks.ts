/**
 * Wiki-link transformation utilities
 * Converts [[slug]], [[slug#heading]], or [[slug|display text]] syntax to markdown links
 */

// Regex to match wiki links: [[slug]], [[slug#heading]], [[slug|text]], [[slug#heading|text]]
export const wikiLinkRegex = /\[\[([^\]#|]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g

/**
 * Normalizes a slug for URL usage
 * - Trims whitespace
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 */
export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, '-')
}

/**
 * Normalizes a heading for URL fragment usage
 * Uses the same logic as Nuxt Content's heading ID generation
 */
export function normalizeHeading(heading: string): string {
  return heading.trim().toLowerCase().replace(/\s+/g, '-')
}

/**
 * Transforms a single wiki-link match to a markdown link
 * [[slug]] → [slug](/slug){.wiki-link}
 * [[slug#heading]] → [slug#heading](/slug#heading){.wiki-link}
 * [[slug|Display Text]] → [Display Text](/slug){.wiki-link}
 * [[slug#heading|Display Text]] → [Display Text](/slug#heading){.wiki-link}
 */
export function transformWikiLink(slug: string, heading?: string, displayText?: string): string {
  const normalizedSlug = normalizeSlug(slug)
  const fragment = heading ? `#${normalizeHeading(heading)}` : ''
  const text = displayText?.trim() || (heading ? `${slug.trim()}#${heading.trim()}` : slug.trim())
  return `[${text}](/${normalizedSlug}${fragment}){.wiki-link}`
}

/**
 * Transforms all wiki-links in a string to markdown links
 */
export function transformWikiLinks(content: string): string {
  return content.replace(wikiLinkRegex, (_, slug: string, heading?: string, displayText?: string) => {
    return transformWikiLink(slug, heading, displayText)
  })
}
