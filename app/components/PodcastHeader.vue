<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink, UButton, UIcon } from '#components'
import type { PodcastItem } from '~/types/content'
import { handleImageError } from '~/utils/imageErrorHandler'

const props = defineProps<{
  podcast: PodcastItem
  hosts: Array<{ slug: string, name: string }>
}>()

const platformIcons: Record<string, string> = {
  spotify: 'i-simple-icons-spotify',
  apple: 'i-simple-icons-applepodcasts',
  youtube: 'i-simple-icons-youtube',
  rss: 'i-lucide-rss',
}

const platformLabels: Record<string, string> = {
  spotify: 'Spotify',
  apple: 'Apple Podcasts',
  youtube: 'YouTube',
  rss: 'RSS',
}

const platformLinks = computed(() => {
  if (!props.podcast.platforms) return []
  return Object.entries(props.podcast.platforms).map(([platform, url]) => ({
    platform,
    url,
    icon: platformIcons[platform] || 'i-lucide-link',
    label: platformLabels[platform] || platform,
  }))
})
</script>

<template>
  <header class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <NuxtLink to="/podcasts" class="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]" aria-label="Back to podcasts">
        <UIcon name="i-lucide-arrow-left" class="size-5" aria-hidden="true" />
      </NuxtLink>
      <UIcon name="i-lucide-podcast" class="size-6" />
      <span class="text-[var(--ui-text-muted)]">Podcast</span>
    </div>

    <div class="flex flex-col sm:flex-row gap-6">
      <div class="shrink-0 size-32 rounded-xl overflow-hidden bg-[var(--ui-bg-muted)]">
        <img
          v-if="podcast.artwork"
          :src="podcast.artwork"
          :alt="podcast.name"
          class="size-full object-cover"
          @error="handleImageError"
        >
        <div
          v-if="!podcast.artwork"
          class="size-full flex items-center justify-center text-[var(--ui-text-muted)]"
        >
          <UIcon name="i-lucide-podcast" class="size-16" />
        </div>
        <div
          v-else
          class="size-full items-center justify-center text-[var(--ui-text-muted)] hidden"
        >
          <UIcon name="i-lucide-podcast" class="size-16" />
        </div>
      </div>

      <div class="flex-1">
        <h1 class="text-3xl font-bold mb-2">
          {{ podcast.name }}
        </h1>

        <p v-if="podcast.description" class="text-[var(--ui-text-muted)] mb-4">
          {{ podcast.description }}
        </p>

        <div v-if="hosts.length" class="mb-4 text-[var(--ui-text-muted)]">
          <span>Hosted by </span>
          <template v-for="(host, index) in hosts" :key="host.slug">
            <NuxtLink
              :to="`/authors/${encodeURIComponent(host.slug)}`"
              class="underline text-[var(--ui-text)]"
            >
              {{ host.name }}
            </NuxtLink>
            <span v-if="index < hosts.length - 1">, </span>
          </template>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            v-if="podcast.website"
            :to="podcast.website"
            target="_blank"
            variant="ghost"
            size="sm"
            icon="i-lucide-globe"
          >
            Website
          </UButton>
          <UButton
            v-for="link in platformLinks"
            :key="link.platform"
            :to="link.url"
            target="_blank"
            variant="ghost"
            size="sm"
            :icon="link.icon"
          >
            {{ link.label }}
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
