import type { Nuxt } from '@nuxt/schema'
import { defineNuxtModule } from '@nuxt/kit'

// Regex to match wiki links: [[slug]] or [[slug|display text]]
const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

// Regex to match Excalidraw image embeds: ![[filename.excalidraw]] or ![[filename.excalidraw.md]]
const excalidrawEmbedRegex = /!\[\[([^\]]+\.excalidraw(?:\.md)?)\]\]/g

interface ContentFileContext {
  file: {
    body: string
  }
}

/**
 * Generate a URL-friendly slug from Excalidraw filename
 */
function slugifyExcalidraw(filename: string): string {
  return filename
    .replace(/\.excalidraw(?:\.md)?$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Nuxt hooks typing is incomplete for content hooks
    ;(nuxt.hooks as { hook: (name: string, cb: (ctx: ContentFileContext) => void) => void }).hook('content:file:beforeParse', (ctx: ContentFileContext) => {
      if (typeof ctx.file?.body === 'string') {
        // Transform Excalidraw embeds first (before wiki-links, since they use similar syntax)
        ctx.file.body = ctx.file.body.replace(excalidrawEmbedRegex, (_, filename: string) => {
          const slug = slugifyExcalidraw(filename)
          // Transform to markdown image pointing to pre-built SVG
          return `![${filename}](/excalidraw/${slug}.svg){.excalidraw-diagram}`
        })

        // Transform regular wiki-links
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
