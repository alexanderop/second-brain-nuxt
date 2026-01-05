import type { CommandPaletteItem } from '@nuxt/ui'

interface PodcastData {
  name: string
  slug: string
  description?: string
  artwork?: string
}

export function transformPodcastToSearchItem(podcast: PodcastData): CommandPaletteItem {
  return {
    id: `podcast:${podcast.slug}`,
    label: podcast.name,
    description: 'Podcast',
    avatar: podcast.artwork ? { src: podcast.artwork, alt: podcast.name } : undefined,
    icon: podcast.artwork ? undefined : 'i-lucide-podcast',
    to: `/podcasts/${podcast.slug}`,
    slot: 'podcast',
  }
}
