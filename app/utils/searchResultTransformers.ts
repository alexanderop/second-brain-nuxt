/**
 * Search result transformation utilities.
 * Includes HTML escaping, snippet extraction, and match highlighting.
 */

/**
 * Escape HTML special characters to prevent XSS attacks.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Escape special regex characters in a string.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Extract a snippet of text around a matched term with context.
 * @param content The full text content
 * @param term The term to find and center the snippet around
 * @param contextChars Number of characters to include before/after the match
 * @returns A snippet with ellipsis if truncated
 */
export function getSnippet(content: string, term: string, contextChars = 60): string {
  const lowerContent = content.toLowerCase()
  const lowerTerm = term.toLowerCase()
  const index = lowerContent.indexOf(lowerTerm)

  if (index === -1) return content.slice(0, 150)

  const start = Math.max(0, index - contextChars)
  const end = Math.min(content.length, index + term.length + contextChars)

  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet += '...'

  return snippet
}

/**
 * Highlight matched terms in text by wrapping them in a mark tag.
 * HTML is escaped before highlighting to prevent XSS attacks.
 * @param text The text to highlight in
 * @param term The term to highlight (case-insensitive)
 * @returns HTML-safe text with matched terms wrapped in <mark> tags
 */
export function highlightMatch(text: string, term: string): string {
  if (!term) return escapeHtml(text)

  const escapedText = escapeHtml(text)
  const escapedTerm = escapeHtml(term)
  const regex = new RegExp(`(${escapeRegex(escapedTerm)})`, 'gi')

  return escapedText.replace(
    regex,
    '<mark class="bg-[var(--ui-primary)]/20 text-[var(--ui-primary)] rounded px-0.5">$1</mark>',
  )
}
