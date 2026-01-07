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
  'newsletter',
] as const

// Personal content types have optional authors
const personalContentTypes = [
  'quote',
  'note',
  'evergreen',
  'map',
] as const

// Combined content types - this Zod enum is the SINGLE SOURCE OF TRUTH
// Nuxt Content generates ContentCollectionItem['type'] from this schema
const contentTypesSchema = z.enum([...externalContentTypes, ...personalContentTypes])

// Newsletter platform values
const newsletterPlatformValues = ['substack', 'beehiiv', 'ghost', 'convertkit', 'buttondown', 'revue', 'mailchimp', 'other'] as const

// Manga status values
const mangaStatusValues = ['ongoing', 'completed', 'hiatus'] as const

// Book reading status values
const readingStatusValues = ['want-to-read', 'reading', 'finished'] as const

// Movie watching status values
const watchingStatusValues = ['want-to-watch', 'watching', 'watched'] as const

// NOTE: Types are derived from @nuxt/content generated types in app/constants/contentTypes.ts
// Do not export types here - import from ~/constants/contentTypes instead

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: { include: '**/*.md', exclude: ['authors/**', 'pages/**', 'podcasts/**', 'tweets/**', 'newsletters/**', 'Readwise/**', 'blog/**', 'Excalidraw/**', 'newsletter-drafts/**', 'blog-ideas/**', '_obsidian-templates/**'] },
      // Note: .passthrough() allows custom frontmatter fields beyond the defined schema
      schema: z.object({
        title: z.string(),
        type: contentTypesSchema,
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
        // Movie watching tracking
        watchingStatus: z.enum(watchingStatusValues).optional(),
        watchedOn: z.string().optional(),
        trailer: z.string().url().optional(),
        // GitHub-specific fields
        stars: z.number().optional(),
        language: z.string().optional(),
        // Rating (1-10 scale, for external content)
        rating: z.number().min(1).max(10).optional(),
        // Podcast episode fields
        podcast: z.string().optional(),
        guests: z.array(z.string()).optional(),
        urls: z.array(z.object({
          platform: z.string(),
          url: z.string().url(),
        })).optional(),
        // Newsletter article fields
        newsletter: z.string().optional(),
        issueNumber: z.number().optional(),
        guest_author: z.string().optional(),
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

    podcasts: defineCollection({
      type: 'data',
      source: 'podcasts/**/*.md',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        artwork: z.string().url().optional(),
        website: z.string().url().optional(),
        hosts: z.array(z.string()).min(1),
        feed: z.string().url().optional(),
        platforms: z.record(z.string(), z.string().url()).optional(),
      }),
    }),

    newsletters: defineCollection({
      type: 'data',
      source: 'newsletters/**/*.md',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        logo: z.string().url().optional(),
        website: z.string().url().optional(),
        authors: z.array(z.string()).min(1),
        platform: z.enum(newsletterPlatformValues).optional(),
        topics: z.array(z.string()).optional(),
      }),
    }),

    tweets: defineCollection({
      type: 'page',
      source: 'tweets/**/*.md',
      schema: z.object({
        type: z.literal('tweet'),
        title: z.string(),
        tweetId: z.string(),
        tweetUrl: z.string().url(),
        tweetText: z.string(),
        author: z.string(), // Author slug (singular for tweets)
        tweetedAt: z.coerce.date(),
        tags: z.array(z.string()).optional(),
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
