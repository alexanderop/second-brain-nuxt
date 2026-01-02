/**
 * Nitro plugin that transforms wiki-link syntax [[slug]] into markdown links
 * before the content is parsed by Nuxt Content
 */
import { defineNitroPlugin } from 'nitropack/runtime'
import { transformWikiLinks } from '../utils/wikilinks'

export default defineNitroPlugin((nitroApp) => {
  // @ts-expect-error - Nuxt Content hook
  nitroApp.hooks.hook('content:file:beforeParse', (file: { body: string }) => {
    if (typeof file.body === 'string') {
      file.body = transformWikiLinks(file.body)
    }
  })
})
