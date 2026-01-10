import type { ContentCollectionItem, NewslettersCollectionItem } from '@nuxt/content'

// Derive types directly from Nuxt Content's generated types
// The Zod schemas in content.config.ts are the single source of truth
export type ContentType = ContentCollectionItem['type']
export type ReadingStatus = NonNullable<ContentCollectionItem['readingStatus']>
export type MangaStatus = NonNullable<ContentCollectionItem['status']>
export type NewsletterPlatform = NonNullable<NewslettersCollectionItem['platform']>

// Runtime arrays for dropdowns, filters, etc.
// These must stay in sync with the Zod schema in content.config.ts
export const externalContentTypes = [
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
  'talk',
] as const satisfies readonly ContentType[]

export const personalContentTypes = [
  'quote',
  'note',
  'evergreen',
  'map',
] as const satisfies readonly ContentType[]

export const contentTypeValues = [...externalContentTypes, ...personalContentTypes] as const satisfies readonly ContentType[]

// Derived types from the arrays (validated against ContentType)
export type ExternalContentType = typeof externalContentTypes[number]
export type PersonalContentType = typeof personalContentTypes[number]
