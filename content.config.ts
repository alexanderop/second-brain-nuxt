import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// External content types require authors
const externalContentTypes = [
  'youtube',
  'podcast',
  'article',
  'book',
  'manga',
  'movie',
  'tv',
  'tweet',
  'course',
  'reddit',
  'github',
] as const

// Manga status values
const mangaStatusValues = ['ongoing', 'completed', 'hiatus'] as const
export type MangaStatus = typeof mangaStatusValues[number]

// Book reading status values
const readingStatusValues = ['want-to-read', 'reading', 'finished'] as const
export type ReadingStatus = typeof readingStatusValues[number]

// Personal content types have optional authors
const personalContentTypes = [
  'quote',
  'note',
  'evergreen',
  'map',
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
      source: { include: '**/*.md', exclude: ['authors/**', 'pages/**'] },
      // Note: .passthrough() allows custom frontmatter fields beyond the defined schema
      schema: z.object({
        title: z.string(),
        type: contentTypes,
        url: z.string().url().optional(),
        cover: z.string().url().optional(),
        tags: z.array(z.string()).default([]),
        authors: z.array(z.string()).default([]),
        summary: z.string().optional(),
        notes: z.string().optional(),
        date: z.string().optional(),
        // Manga-specific fields
        volumes: z.number().optional(),
        status: z.enum(mangaStatusValues).optional(),
        // Book reading tracking
        readingStatus: z.enum(readingStatusValues).optional(),
        startedReading: z.string().optional(),
        finishedReading: z.string().optional(),
        // GitHub-specific fields
        stars: z.number().optional(),
        language: z.string().optional(),
      }).passthrough().superRefine((data, ctx) => {
        // Authors required for external content types
        const external: readonly string[] = externalContentTypes
        if (external.includes(data.type) && data.authors.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `authors is required for ${data.type} content type`,
            path: ['authors'],
          })
        }
        // Volumes and status required for manga type
        if (data.type === 'manga') {
          if (data.volumes === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'volumes is required for manga content type',
              path: ['volumes'],
            })
          }
          if (data.status === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'status is required for manga content type',
              path: ['status'],
            })
          }
        }
      }),
    }),

    authors: defineCollection({
      type: 'data',
      source: 'authors/**/*.md',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        website: z.string().optional(),
        socials: z.object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          linkedin: z.string().optional(),
          youtube: z.string().optional(),
        }).optional(),
      }),
    }),

    pages: defineCollection({
      type: 'page',
      source: 'pages/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        avatar: z.string().optional(),
        website: z.string().optional(),
        socials: z.object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          linkedin: z.string().optional(),
          youtube: z.string().optional(),
          bluesky: z.string().optional(),
        }).optional(),
      }),
    }),
  },
})
