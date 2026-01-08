<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import { NuxtLink, UPopover, UBadge } from '#components'
import type { ContentType } from '~/constants/contentTypes'

const props = defineProps<{
  href?: string
  target?: string
  class?: string
}>()

const isWikiLink = computed(() => props.class?.includes('wiki-link'))
const slug = computed(() => {
  const path = props.href?.replace(/^\//, '') || ''
  return path.split('#')[0] // Strip hash for content query
})

// Fetch preview data for wiki-links
const { data: linkData } = await useAsyncData(
  `wiki-link-${slug.value}`,
  async () => {
    if (!isWikiLink.value || !slug.value)
      return null

    return queryCollection('content')
      .select('title', 'summary', 'type', 'tags', 'stem')
      .where('stem', '=', slug.value)
      .first()
  },
  { default: () => null },
)

const exists = computed(() => !!linkData.value)

const linkClass = computed(() => {
  if (!isWikiLink.value)
    return props.class
  return exists.value ? props.class : `${props.class} broken`
})

// Type-based colors for badges
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const typeColors: Record<ContentType, BadgeColor> = {
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
}
</script>

<template>
  <!-- Wiki-link with preview popover -->
  <UPopover
    v-if="isWikiLink && exists"
    mode="hover"
    :open-delay="350"
    :close-delay="150"
    :ui="{ content: 'p-0' }"
  >
    <NuxtLink
      :to="href"
      :class="linkClass"
    >
      <slot />
    </NuxtLink>

    <template #content>
      <div class="w-72 p-3 space-y-2">
        <!-- Type badge -->
        <UBadge
          v-if="linkData?.type"
          :label="linkData.type"
          :color="typeColors[linkData.type] || 'neutral'"
          variant="subtle"
          size="xs"
        />

        <!-- Title -->
        <p class="font-semibold text-sm leading-snug">
          {{ linkData?.title }}
        </p>

        <!-- Summary -->
        <p
          v-if="linkData?.summary"
          class="text-xs text-muted line-clamp-3"
        >
          {{ linkData.summary }}
        </p>

        <!-- Tags -->
        <div
          v-if="linkData?.tags?.length"
          class="flex gap-1 flex-wrap pt-1"
        >
          <UBadge
            v-for="tag in linkData.tags.slice(0, 4)"
            :key="tag"
            :label="tag"
            color="neutral"
            variant="outline"
            size="xs"
          />
          <span
            v-if="linkData.tags.length > 4"
            class="text-xs text-muted"
          >
            +{{ linkData.tags.length - 4 }}
          </span>
        </div>
      </div>
    </template>
  </UPopover>

  <!-- Regular link or broken wiki-link (no popover) -->
  <NuxtLink
    v-else
    :to="href"
    :target="target"
    :class="linkClass"
  >
    <slot />
  </NuxtLink>
</template>
