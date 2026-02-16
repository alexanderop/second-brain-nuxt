import type { ContentType, NewsletterPlatform, ReadingStatus } from '~/constants/contentTypes'

export interface ContentItem {
  slug: string
  title: string
  type: ContentType
  url?: string
  tags?: Array<string>
  authors?: Array<string>
  date?: Date | string
  summary?: string
  rating?: number
  // Book reading tracking
  readingStatus?: ReadingStatus
  startedReading?: string
  finishedReading?: string
  // Podcast episode fields
  podcast?: string
  guests?: Array<string>
  urls?: Array<{ platform: string, url: string }>
  // Newsletter article fields
  newsletter?: string
  issueNumber?: number
  guest_author?: string
}

export interface PodcastItem {
  name: string
  slug: string
  description?: string
  artwork?: string
  website?: string
  hosts: Array<string>
  feed?: string
  platforms?: Record<string, string>
}

export interface NewsletterItem {
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  authors: Array<string>
  platform?: NewsletterPlatform
  topics?: Array<string>
}

export interface TweetItem {
  slug: string
  type: 'tweet'
  title: string
  tweetId: string
  tweetUrl: string
  tweetText: string
  author: string // Author slug (singular for tweets)
  tweetedAt: Date | string
  tags?: Array<string>
}

// Type guards for content collections
export function isPodcastItem(p: unknown): p is PodcastItem {
  return typeof p === 'object' && p !== null && 'slug' in p && 'name' in p && 'hosts' in p
}

export function isNewsletterItem(p: unknown): p is NewsletterItem {
  return typeof p === 'object' && p !== null && 'slug' in p && 'name' in p && 'authors' in p
}
