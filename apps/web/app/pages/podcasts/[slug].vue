<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useAsyncData, queryCollection, createError } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { UIcon } from '#components'
import PodcastHeader from '~/components/PodcastHeader.vue'
import ContentList from '~/components/ContentList.vue'
import type { PodcastItem } from '~/types/content'
import type { ContentType } from '~/constants/contentTypes'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

function isPodcastItem(p: unknown): p is PodcastItem {
  return typeof p === 'object' && p !== null && 'slug' in p && 'name' in p && 'hosts' in p
}

const { data: podcast } = await useAsyncData(`podcast-${slug.value}`, () => {
  return queryCollection('podcasts')
    .where('slug', '=', slug.value)
    .first()
})

if (!podcast.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Podcast not found',
  })
}

const typedPodcast = computed(() => {
  if (isPodcastItem(podcast.value)) return podcast.value
  return null
})

const { data: episodes } = await useAsyncData(`podcast-episodes-${slug.value}`, () => {
  return queryCollection('content')
    .where('type', '=', 'podcast')
    .where('podcast', '=', slug.value)
    .order('date', 'DESC')
    .all()
})

async function fetchHostAuthor(hostSlug: string) {
  const author = await queryCollection('authors')
    .where('slug', '=', hostSlug)
    .first()
  return author
    ? { slug: hostSlug, name: author.name }
    : { slug: hostSlug, name: hostSlug }
}

const { data: hostAuthors } = await useAsyncData(`podcast-hosts-${slug.value}`, async () => {
  const hosts = typedPodcast.value?.hosts
  if (!hosts?.length) return []
  return Promise.all(hosts.map(fetchHostAuthor))
})

interface ContentWithBody {
  stem?: string
  slug: string
  title: string
  type: ContentType
  date?: string
  authors?: string[]
  tags?: string[]
  summary?: string
  rating?: number
  body?: { value?: unknown[] }
}

function hasStringSlug(obj: object): obj is { slug: string } {
  return 'slug' in obj && typeof obj.slug === 'string'
}

function isContentWithBody(item: unknown): item is ContentWithBody {
  if (typeof item !== 'object' || item === null) return false
  return hasStringSlug(item)
}

function checkLinksInBody(item: ContentWithBody, slugsToCheck: string[]): boolean {
  if (!item.body?.value) return false
  const bodyStr = JSON.stringify(item.body.value)
  return slugsToCheck.some(s => bodyStr.includes(`[[${s}]]`))
}

function getEpisodeSlugs(eps: typeof episodes.value): string[] {
  if (!eps) return []
  return eps.map(e => String(e.slug))
}

const { data: relatedContent } = await useAsyncData(`podcast-related-${slug.value}`, async () => {
  const episodeSlugs = getEpisodeSlugs(episodes.value)
  if (episodeSlugs.length === 0) return []

  const allContent = await queryCollection('content').all()

  const slugsToCheck: string[] = [...episodeSlugs, slug.value]
  const related: ContentWithBody[] = []

  for (const item of allContent) {
    if (!isContentWithBody(item)) continue
    if (episodeSlugs.includes(item.slug)) continue
    if (checkLinksInBody(item, slugsToCheck)) {
      related.push(item)
    }
  }

  return related
})

usePageTitle(() => typedPodcast.value?.name ?? 'Podcast')
</script>

<template>
  <div v-if="typedPodcast">
    <PodcastHeader
      :podcast="typedPodcast"
      :hosts="hostAuthors ?? []"
    />

    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-list" class="size-5 text-[var(--ui-text-muted)]" />
        <h2 class="text-xl font-semibold">
          Episodes
        </h2>
        <span class="text-[var(--ui-text-muted)]">({{ episodes?.length ?? 0 }})</span>
      </div>
      <ContentList v-if="episodes?.length" :items="episodes" />
      <p v-else class="text-[var(--ui-text-muted)]">
        No episodes yet.
      </p>
    </section>

    <section v-if="relatedContent?.length">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-link" class="size-5 text-[var(--ui-text-muted)]" />
        <h2 class="text-xl font-semibold">
          Related
        </h2>
        <span class="text-[var(--ui-text-muted)]">({{ relatedContent.length }})</span>
      </div>
      <ContentList :items="relatedContent" />
    </section>
  </div>
</template>
