import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const contentTypeValues = [
  'youtube',
  'podcast',
  'article',
  'book',
  'movie',
  'tv',
  'tweet',
  'quote',
  'course',
  'note',
  'evergreen',
] as const

export type ContentType = typeof contentTypeValues[number]

const contentTypes = z.enum(contentTypeValues)

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string(),
        type: contentTypes,
        url: z.string().url().optional(),
        tags: z.array(z.string()).default([]),
        summary: z.string().optional(),
        notes: z.string().optional(),
        date: z.string().optional(),
      }),
    }),
  },
})
