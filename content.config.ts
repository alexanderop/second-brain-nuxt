import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// External content types require authors
const externalContentTypes = [
  'youtube',
  'podcast',
  'article',
  'book',
  'movie',
  'tv',
  'tweet',
  'course',
] as const

// Personal content types have optional authors
const personalContentTypes = [
  'quote',
  'note',
  'evergreen',
] as const

const contentTypeValues = [...externalContentTypes, ...personalContentTypes] as const

export type ContentType = typeof contentTypeValues[number]
export type ExternalContentType = typeof externalContentTypes[number]
export type PersonalContentType = typeof personalContentTypes[number]

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
        authors: z.array(z.string()).default([]),
        summary: z.string().optional(),
        notes: z.string().optional(),
        date: z.string().optional(),
      }).superRefine((data, ctx) => {
        // Authors required for external content types
        const external: readonly string[] = externalContentTypes
        if (external.includes(data.type) && data.authors.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `authors is required for ${data.type} content type`,
            path: ['authors'],
          })
        }
      }),
    }),
  },
})
