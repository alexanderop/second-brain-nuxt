<script setup lang="ts">
import { NuxtLink, UIcon } from '#components'
import type { PodcastItem } from '~/types/content'
import { handleImageError } from '~/utils/imageErrorHandler'

defineProps<{
  podcast: PodcastItem
  episodeCount: number
}>()
</script>

<template>
  <NuxtLink
    :to="`/podcasts/${podcast.slug}`"
    class="group flex items-center gap-4 p-3 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors"
  >
    <div class="shrink-0 size-16 rounded-lg overflow-hidden bg-[var(--ui-bg-muted)]">
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
        <UIcon name="i-lucide-podcast" class="size-8" />
      </div>
      <div
        v-else
        class="size-full items-center justify-center text-[var(--ui-text-muted)] hidden"
      >
        <UIcon name="i-lucide-podcast" class="size-8" />
      </div>
    </div>
    <div class="min-w-0 flex-1">
      <h3 class="font-medium group-hover:underline">
        {{ podcast.name }}
      </h3>
      <p class="text-sm text-[var(--ui-text-muted)]">
        {{ episodeCount }} {{ episodeCount === 1 ? 'episode' : 'episodes' }}
      </p>
    </div>
  </NuxtLink>
</template>
