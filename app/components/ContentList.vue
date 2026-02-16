<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import ContentCard from '~/components/ContentCard.vue'
import type { ContentItem, PodcastItem } from '~/types/content'

interface ContentListItem extends Omit<ContentItem, 'slug'> {
  stem?: string
  slug?: string
  rating?: number
  podcast?: string
  guests?: string[]
}

const props = defineProps<{
  items: Array<ContentListItem>
  selectedIndex?: number
}>()

const podcastSlugs = computed(() => {
  const slugs = new Set<string>()
  for (const item of props.items) {
    if (item.podcast) slugs.add(item.podcast)
  }
  return Array.from(slugs)
})

const { data: podcasts } = await useAsyncData(
  'content-list-podcasts',
  async () => {
    if (podcastSlugs.value.length === 0) return []
    return queryCollection('podcasts').select('slug', 'name').all()
  },
  { watch: [podcastSlugs] },
)

function isPodcastItem(p: unknown): p is PodcastItem {
  return typeof p === 'object' && p !== null && 'slug' in p && 'name' in p && 'hosts' in p
}

const podcastMap = computed(() => {
  const map: Record<string, string> = {}
  for (const p of podcasts.value ?? []) {
    if (isPodcastItem(p)) {
      map[p.slug] = p.name
    }
  }
  return map
})
</script>

<template>
  <div v-if="items.length > 0">
    <ContentCard
      v-for="(item, index) in items"
      :key="item.stem ?? item.slug"
      :content="{ slug: item.stem ?? item.slug ?? '', title: item.title, type: item.type, tags: item.tags, authors: item.authors, date: item.date, summary: item.summary, rating: item.rating, podcast: item.podcast, guests: item.guests }"
      :selected="index === selectedIndex"
      :podcast-name="item.podcast ? podcastMap[item.podcast] : undefined"
    />
  </div>
  <div v-else class="py-8 text-center text-[var(--ui-text-muted)]">
    No content found.
  </div>
</template>
