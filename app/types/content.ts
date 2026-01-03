import type { ContentType, ReadingStatus } from '~~/content.config'

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
