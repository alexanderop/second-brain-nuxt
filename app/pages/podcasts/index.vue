<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { UIcon } from '#components'
import PodcastCard from '~/components/PodcastCard.vue'
import { isPodcastItem } from '~/types/content'
import type { PodcastItem } from '~/types/content'

interface EpisodeData {
  podcast?: string
  date?: string
}

const { data: allPodcasts } = await useAsyncData('all-podcasts', () => {
  return queryCollection('podcasts').all()
})

const { data: allEpisodes } = await useAsyncData('all-podcast-episodes', () => {
  return queryCollection('content')
    .where('type', '=', 'podcast')
    .select('podcast', 'date')
    .all()
})

interface PodcastStats {
  count: number
  mostRecent: string | null
}

const podcastStats = computed(() => {
  const stats: Record<string, PodcastStats> = {}
  for (const ep of allEpisodes.value ?? []) {
    if (!isPodcastEpisode(ep)) continue
    const podcastSlug = ep.podcast
    if (!podcastSlug) continue

    if (!stats[podcastSlug]) {
      stats[podcastSlug] = { count: 0, mostRecent: null }
    }
    stats[podcastSlug].count++
    const date = ep.date
    const existing = stats[podcastSlug].mostRecent
    if (date && (!existing || date > existing)) {
      stats[podcastSlug].mostRecent = date
    }
  }
  return stats
})

function isPodcastEpisode(ep: unknown): ep is EpisodeData {
  return typeof ep === 'object' && ep !== null
}

const activePodcasts = computed(() => {
  const podcasts = (allPodcasts.value ?? []).filter(isPodcastItem)
  const stats = podcastStats.value
  return podcasts
    .filter(p => (stats[p.slug]?.count ?? 0) > 0)
    .sort((a, b) => {
      const dateA = stats[a.slug]?.mostRecent ?? ''
      const dateB = stats[b.slug]?.mostRecent ?? ''
      return dateB.localeCompare(dateA)
    })
})

usePageTitle('Podcasts')
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UIcon name="i-lucide-podcast" class="size-6" />
      <h1 class="text-2xl font-semibold">
        Podcasts
      </h1>
    </div>

    <div v-if="activePodcasts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PodcastCard
        v-for="podcast in activePodcasts"
        :key="podcast.slug"
        :podcast="podcast"
        :episode-count="podcastStats[podcast.slug]?.count ?? 0"
      />
    </div>

    <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
      No podcasts with episodes found.
    </div>
  </div>
</template>
