import type { ContentType } from '~/constants/contentTypes'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

/** Nuxt UI badge color names for content type badges */
export const CONTENT_TYPE_BADGE_COLORS: Record<ContentType, BadgeColor> = {
  youtube: 'error',
  podcast: 'secondary',
  article: 'info',
  book: 'warning',
  manga: 'warning',
  movie: 'error',
  tv: 'info',
  tweet: 'info',
  quote: 'success',
  course: 'warning',
  note: 'neutral',
  evergreen: 'success',
  map: 'secondary',
  reddit: 'warning',
  github: 'neutral',
  newsletter: 'info',
  talk: 'primary',
}
