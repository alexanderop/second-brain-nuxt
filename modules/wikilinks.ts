import type { Nuxt } from '@nuxt/schema'
import { defineNuxtModule } from '@nuxt/kit'

// Regex to match wiki links: [[slug]] or [[slug|display text]]
const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

interface ContentFileContext {
  file: {
    body: string
  }
}

/**
 * Nuxt module that transforms wiki-link syntax [[slug]] into markdown links
 * before the content is parsed by Nuxt Content
 */
export default defineNuxtModule({
  meta: {
    name: 'wikilinks',
    configKey: 'wikilinks',
  },
  setup(_options: unknown, nuxt: Nuxt) {
    // eslint-disable-next-line ts/no-explicit-any
    ;(nuxt.hooks as any).hook('content:file:beforeParse', (ctx: ContentFileContext) => {
      if (typeof ctx.file?.body === 'string') {
        ctx.file.body = ctx.file.body.replace(wikiLinkRegex, (_, slug: string, displayText?: string) => {
          const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-')
          const text = displayText?.trim() || slug.trim()
          // Use MDC attribute syntax to add wiki-link class
          return `[${text}](/${normalizedSlug}){.wiki-link}`
        })
      }
    })
  },
})
