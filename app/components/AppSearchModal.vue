<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useAsyncData, navigateTo, queryCollectionSearchSections, queryCollection } from '#imports'
import { UModal, UCommandPalette, UAvatar } from '#components'
import type { CommandPaletteItem, CommandPaletteGroup } from '@nuxt/ui'
import { transformPodcastToSearchItem } from '~/utils/searchHelpers'

const open = defineModel<boolean>('open', { default: false })
const route = useRoute()

// Fetch search sections with full body content
const { data: searchSections } = await useAsyncData(
  'search-modal-sections',
  () => queryCollectionSearchSections('content'),
)

// Fetch authors for search
const { data: authors } = await useAsyncData(
  'search-modal-authors',
  () => queryCollection('authors').select('name', 'slug', 'avatar').all(),
)

// Fetch newsletters for search
const { data: newsletters } = await useAsyncData(
  'search-modal-newsletters',
  () => queryCollection('newsletters').select('name', 'slug', 'logo').all(),
)

// Fetch podcasts for search
const { data: podcasts } = await useAsyncData(
  'search-modal-podcasts',
  () => queryCollection('podcasts').select('name', 'slug', 'artwork').all(),
)

// Close modal when route changes
watch(() => route.fullPath, () => {
  open.value = false
})

// Build content items for CommandPalette
const contentItems = computed<CommandPaletteItem[]>(() => {
  if (!searchSections.value) return []

  const seen = new Set<string>()
  const items: CommandPaletteItem[] = []

  for (const section of searchSections.value) {
    if (!section.id) continue
    const path = section.id.split('#')[0] || ''
    if (seen.has(path)) continue
    seen.add(path)

    const breadcrumb = [...(section.titles || []), section.title].filter(Boolean).join(' › ')
    const snippet = section.content?.slice(0, 100) || ''

    items.push({
      id: section.id,
      label: breadcrumb,
      description: snippet,
      icon: 'i-lucide-file-text',
      to: path,
    })
  }

  return items
})

// Build author items for CommandPalette
const authorItems = computed<CommandPaletteItem[]>(() => {
  if (!authors.value) return []

  return authors.value.map(author => ({
    id: `author:${author.slug}`,
    label: author.name,
    description: 'Author',
    avatar: author.avatar ? { src: author.avatar, alt: author.name } : undefined,
    icon: author.avatar ? undefined : 'i-lucide-user',
    to: `/authors/${encodeURIComponent(author.slug)}`,
    slot: 'author',
  }))
})

// Build newsletter items for CommandPalette
const newsletterItems = computed<CommandPaletteItem[]>(() => {
  if (!newsletters.value) return []

  return newsletters.value.map(newsletter => ({
    id: `newsletter:${newsletter.slug}`,
    label: newsletter.name,
    description: 'Newsletter',
    avatar: newsletter.logo ? { src: newsletter.logo, alt: newsletter.name } : undefined,
    icon: newsletter.logo ? undefined : 'i-lucide-newspaper',
    to: `/newsletters/${newsletter.slug}`,
    slot: 'newsletter',
  }))
})

// Build podcast items for CommandPalette
const podcastItems = computed<CommandPaletteItem[]>(() => {
  if (!podcasts.value) return []
  return podcasts.value.map(transformPodcastToSearchItem)
})

// Combined groups for CommandPalette
const groups = computed<CommandPaletteGroup[]>(() => {
  const result: CommandPaletteGroup[] = []

  if (contentItems.value.length) {
    result.push({
      id: 'content',
      label: 'Notes',
      items: contentItems.value,
    })
  }

  if (authorItems.value.length) {
    result.push({
      id: 'authors',
      label: 'Authors',
      items: authorItems.value,
    })
  }

  if (newsletterItems.value.length) {
    result.push({
      id: 'newsletters',
      label: 'Newsletters',
      items: newsletterItems.value,
    })
  }

  if (podcastItems.value.length) {
    result.push({
      id: 'podcasts',
      label: 'Podcasts',
      items: podcastItems.value,
    })
  }

  return result
})

// Fuse.js configuration
const fuseOptions = {
  fuseOptions: {
    keys: ['label', 'description'],
    threshold: 0.3,
    ignoreLocation: true,
  },
  resultLimit: 15,
}

function onSelect(item: CommandPaletteItem) {
  if (typeof item.to === 'string') {
    navigateTo(item.to)
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Search" description="Search notes, authors, newsletters, and podcasts">
    <template #content>
      <UCommandPalette
        :groups="groups"
        :fuse="fuseOptions"
        placeholder="Search notes, authors, newsletters, podcasts..."
        class="h-96"
        :close="{ icon: 'i-lucide-x', color: 'neutral', variant: 'ghost' }"
        @update:model-value="onSelect"
        @update:open="open = $event"
      >
        <template #author-leading="{ item }">
          <UAvatar
            v-if="item.avatar"
            :src="item.avatar.src"
            :alt="item.avatar.alt"
            size="2xs"
          />
          <span v-else class="i-lucide-user size-5 text-[var(--ui-text-muted)]" />
        </template>

        <template #newsletter-leading="{ item }">
          <UAvatar
            v-if="item.avatar"
            :src="item.avatar.src"
            :alt="item.avatar.alt"
            size="2xs"
          />
          <span v-else class="i-lucide-newspaper size-5 text-[var(--ui-text-muted)]" />
        </template>

        <template #podcast-leading="{ item }">
          <UAvatar
            v-if="item.avatar"
            :src="item.avatar.src"
            :alt="item.avatar.alt"
            size="2xs"
          />
          <span v-else class="i-lucide-podcast size-5 text-[var(--ui-text-muted)]" />
        </template>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-6 text-[var(--ui-text-muted)]">
            <span class="i-lucide-search-x size-8 mb-2" aria-hidden="true" />
            <p>No results found</p>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
