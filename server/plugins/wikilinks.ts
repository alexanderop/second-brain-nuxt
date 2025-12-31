/**
 * Nitro plugin that transforms wiki-link syntax [[slug]] into markdown links
 * before the content is parsed by Nuxt Content
 */

// Regex to match wiki links: [[slug]] or [[slug|display text]]
const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export default defineNitroPlugin((nitroApp) => {
  // @ts-expect-error - Nuxt Content hook
  nitroApp.hooks.hook('content:file:beforeParse', (file: { body: string }) => {
    if (typeof file.body === 'string') {
      file.body = file.body.replace(wikiLinkRegex, (_, slug: string, displayText?: string) => {
        const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-')
        const text = displayText?.trim() || slug.trim()
        // Use MDC attribute syntax to add wiki-link class
        return `[${text}](/${normalizedSlug}){.wiki-link}`
      })
    }
  })
})
