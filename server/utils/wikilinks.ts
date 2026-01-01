/**
 * Wiki-link transformation utilities
 * Converts [[slug]] or [[slug|display text]] syntax to markdown links
 */

// Regex to match wiki links: [[slug]] or [[slug|display text]]
export const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

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
 * Transforms a single wiki-link match to a markdown link
 * [[slug]] → [slug](/slug){.wiki-link}
 * [[slug|Display Text]] → [Display Text](/slug){.wiki-link}
 */
export function transformWikiLink(slug: string, displayText?: string): string {
  const normalizedSlug = normalizeSlug(slug)
  const text = displayText?.trim() || slug.trim()
  return `[${text}](/${normalizedSlug}){.wiki-link}`
}

/**
 * Transforms all wiki-links in a string to markdown links
 */
export function transformWikiLinks(content: string): string {
  return content.replace(wikiLinkRegex, (_, slug: string, displayText?: string) => {
    return transformWikiLink(slug, displayText)
  })
}
