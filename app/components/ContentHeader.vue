<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useRequestURL } from '#imports'
import { NuxtLink, UButton, UDropdownMenu, UIcon } from '#components'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import BaseTagPill from '~/components/BaseTagPill.vue'
import BaseRatingDisplay from '~/components/BaseRatingDisplay.vue'
import type { ContentItem, NewsletterItem, PodcastItem } from '~/types/content'

const props = defineProps<{
  content: ContentItem
  podcast?: PodcastItem
  newsletter?: NewsletterItem
  hosts?: Array<{ slug: string, name: string }>
}>()

const { copy, copied } = useClipboard()
const requestUrl = useRequestURL()

const copyItems = computed<DropdownMenuItem[]>(() => {
  const items: DropdownMenuItem[] = [
    {
      label: 'Copy Wiki',
      icon: 'i-lucide-link',
      onSelect: () => copy(`[[${props.content.slug}]]`),
    },
    {
      label: 'Copy URL',
      icon: 'i-lucide-globe',
      onSelect: () => copy(`${requestUrl.origin}/${props.content.slug}`),
    },
    {
      label: 'Copy Markdown',
      icon: 'i-lucide-file-text',
      onSelect: async () => {
        const { raw } = await $fetch<{ raw: string }>(`/api/raw-content/${props.content.slug}`)
        copy(raw)
      },
    },
  ]

  // Add Copy Source option if origin URL exists
  if (props.content.url) {
    items.push({
      label: 'Copy Source',
      icon: 'i-lucide-external-link',
      onSelect: () => {
        if (props.content.url)
          copy(props.content.url)
      },
    })
  }

  return items
})

function formatDate(date?: Date | string) {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <header class="mb-8">
    <div class="flex items-center gap-2 mb-2 text-[var(--ui-text-muted)]">
      <BaseTypeIcon :type="content.type" size="sm" />
      <span class="text-sm capitalize">{{ content.type }}</span>
      <span v-if="content.date" class="text-sm">{{ formatDate(content.date) }}</span>
    </div>
    <h1 class="text-3xl font-bold mb-4">
      {{ content.title }}
    </h1>

    <!-- Podcast badge for episode pages -->
    <div v-if="podcast" class="mb-4">
      <NuxtLink
        :to="`/podcasts/${podcast.slug}`"
        class="inline-flex items-center gap-3 p-2 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors"
      >
        <div class="shrink-0 size-10 rounded-lg overflow-hidden bg-[var(--ui-bg-muted)]">
          <img
            v-if="podcast.artwork"
            :src="podcast.artwork"
            :alt="podcast.name"
            class="size-full object-cover"
          >
          <div v-else class="size-full flex items-center justify-center text-[var(--ui-text-muted)]">
            <UIcon name="i-lucide-podcast" class="size-5" />
          </div>
        </div>
        <span class="font-medium">{{ podcast.name }}</span>
      </NuxtLink>
    </div>

    <!-- Newsletter badge for newsletter articles -->
    <div v-if="newsletter" class="mb-4">
      <NuxtLink
        :to="`/newsletters/${newsletter.slug}`"
        class="inline-flex items-center gap-3 p-2 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors"
      >
        <div class="shrink-0 size-10 rounded-lg overflow-hidden bg-[var(--ui-bg-muted)]">
          <img
            v-if="newsletter.logo"
            :src="newsletter.logo"
            :alt="newsletter.name"
            class="size-full object-cover"
          >
          <div v-else class="size-full flex items-center justify-center text-[var(--ui-text-muted)]">
            <UIcon name="i-lucide-newspaper" class="size-5" />
          </div>
        </div>
        <span class="font-medium">{{ newsletter.name }}</span>
      </NuxtLink>
    </div>

    <!-- Hosts and guests for podcast episodes -->
    <div v-if="podcast && (hosts?.length || content.guests?.length)" class="mb-4 text-[var(--ui-text-muted)]">
      <template v-if="content.guests?.length">
        <span>Guest: </span>
        <template v-for="(guest, index) in content.guests" :key="guest">
          <NuxtLink
            :to="`/authors/${encodeURIComponent(guest)}`"
            class="hover:underline text-[var(--ui-text)]"
          >
            {{ guest }}
          </NuxtLink>
          <span v-if="index < content.guests.length - 1">, </span>
        </template>
        <span v-if="hosts?.length"> &bull; </span>
      </template>
      <template v-if="hosts?.length">
        <span>Hosted by </span>
        <template v-for="(host, index) in hosts" :key="host.slug">
          <NuxtLink
            :to="`/authors/${encodeURIComponent(host.slug)}`"
            class="hover:underline text-[var(--ui-text)]"
          >
            {{ host.name }}
          </NuxtLink>
          <span v-if="index < hosts.length - 1">, </span>
        </template>
      </template>
    </div>

    <!-- Standard authors for non-podcast content -->
    <div v-else-if="content.authors?.length" class="mb-4 text-[var(--ui-text-muted)]">
      <span>by </span>
      <template v-for="(author, index) in content.authors" :key="author">
        <NuxtLink
          :to="`/authors/${encodeURIComponent(author)}`"
          class="hover:underline text-[var(--ui-text)]"
        >
          {{ author }}
        </NuxtLink>
        <span v-if="index < content.authors.length - 1">, </span>
      </template>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <BaseTagPill v-for="tag in (content.tags ?? [])" :key="tag" :tag="tag" />
      <BaseRatingDisplay v-if="content.rating" :rating="content.rating" />
      <UDropdownMenu :items="copyItems" class="ml-2">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        />
      </UDropdownMenu>
      <UButton
        v-if="content.url"
        :to="content.url"
        target="_blank"
        variant="outline"
        color="neutral"
        size="sm"
        icon="i-lucide-external-link"
      >
        Open Link
      </UButton>
    </div>
  </header>
</template>
