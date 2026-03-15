import { describe, expect, it } from 'vitest'
import { transformPodcastToSearchItem } from '../../../app/utils/searchHelpers'

describe('transformPodcastToSearchItem', () => {
  it('transforms podcast to CommandPaletteItem format', () => {
    const podcast = {
      name: 'Huberman Lab',
      slug: 'huberman-lab',
      description: 'Science and science-based tools',
      artwork: 'https://example.com/artwork.jpg',
    }

    const result = transformPodcastToSearchItem(podcast)

    expect(result).toEqual({
      id: 'podcast:huberman-lab',
      label: 'Huberman Lab',
      description: 'Podcast',
      avatar: { src: 'https://example.com/artwork.jpg', alt: 'Huberman Lab' },
      icon: undefined,
      to: '/podcasts/huberman-lab',
      slot: 'podcast',
    })
  })

  it('uses fallback icon when no artwork', () => {
    const podcast = {
      name: 'My Podcast',
      slug: 'my-podcast',
    }

    const result = transformPodcastToSearchItem(podcast)

    expect(result.avatar).toBeUndefined()
    expect(result.icon).toBe('i-lucide-podcast')
  })
})
