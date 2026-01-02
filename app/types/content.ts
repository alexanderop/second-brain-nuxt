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
  // Book reading tracking
  readingStatus?: ReadingStatus
  startedReading?: string
  finishedReading?: string
}
