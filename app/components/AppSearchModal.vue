<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useRoute, useAsyncData, navigateTo, queryCollectionSearchSections, queryCollection } from '#imports'
import { UModal, UCommandPalette, UAvatar } from '#components'
import type { CommandPaletteItem, CommandPaletteGroup } from '@nuxt/ui'
import { transformPodcastToSearchItem } from '~/utils/searchHelpers'
import { useDebouncedSemanticSearch } from '~/composables/useDebouncedSemanticSearch'
import { mergeSearchResults, type KeywordResult } from '~/utils/hybridSearch'
import Fuse from 'fuse.js'

const open = defineModel<boolean>('open', { default: false })
const searchTerm = ref('')
const debouncedSearchTerm = ref('')

// Debounce search term for semantic search (consistent 250ms across app)
watchDebounced(
  searchTerm,
  (value) => {
    debouncedSearchTerm.value = value
  },
  { debounce: 250 },
)

// Semantic search with debouncing and proper async handling
const {
  results: semanticResults,
  hasSearchRun: hasSemanticSearchRun,
  isLoading: semanticLoading,
  error: semanticError,
} = useDebouncedSemanticSearch(debouncedSearchTerm)
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

// Fetch content metadata for enriching search (tags, type, authors)
const { data: contentMetadata } = await useAsyncData(
  'search-modal-metadata',
  () => queryCollection('content').select('stem', 'tags', 'type', 'authors').all(),
)

// Build metadata lookup map
const metadataMap = computed(() => {
  if (!contentMetadata.value) return new Map<string, { tags: string[], type: string, authors: string[] }>()
  return new Map(contentMetadata.value.map(c => [
    `/${c.stem}`,
    { tags: c.tags ?? [], type: c.type, authors: c.authors ?? [] },
  ]))
})

// Close modal when route changes
watch(() => route.fullPath, () => {
  open.value = false
})

// Reset search state when modal closes
watch(open, (isOpen) => {
  if (!isOpen) {
    searchTerm.value = ''
    debouncedSearchTerm.value = ''
    semanticResults.value = []
    hasSemanticSearchRun.value = false
  }
})

// Build content items lookup map for CommandPalette
const contentItemsMap = computed<Map<string, CommandPaletteItem>>(() => {
  if (!searchSections.value) return new Map()

  const seen = new Set<string>()
  const itemsMap = new Map<string, CommandPaletteItem>()

  for (const section of searchSections.value) {
    if (!section.id) continue
    const path = section.id.split('#')[0] || ''
    if (seen.has(path)) continue
    seen.add(path)

    const breadcrumb = [...(section.titles || []), section.title].filter(Boolean).join(' › ')
    const snippet = section.content?.slice(0, 100) || ''

    // Get metadata for searchable keywords
    const meta = metadataMap.value.get(path)
    const keywords = meta
      ? [...meta.tags, meta.type, ...meta.authors].filter(Boolean).join(' ')
      : ''

    itemsMap.set(path, {
      id: section.id,
      label: breadcrumb,
      description: snippet,
      keywords,
      icon: 'i-lucide-file-text',
      to: path,
    })
  }

  return itemsMap
})

// All content items as array
const contentItems = computed<CommandPaletteItem[]>(() => {
  return Array.from(contentItemsMap.value.values())
})

// Fuse.js instance for keyword search on content
const contentFuse = computed(() => {
  if (contentItems.value.length === 0) return null
  return new Fuse(contentItems.value, {
    keys: [
      { name: 'label', weight: 1 },
      { name: 'description', weight: 0.7 },
      { name: 'keywords', weight: 0.9 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  })
})

// Hybrid-scored content items when searching
const hybridContentItems = computed<CommandPaletteItem[]>(() => {
  const query = debouncedSearchTerm.value
  if (!query || !contentFuse.value) return contentItems.value

  // Get keyword results from Fuse
  const fuseResults = contentFuse.value.search(query)
  const keywordResults: KeywordResult[] = fuseResults.map((result) => {
    const item = result.item
    const path = typeof item.to === 'string' ? item.to : ''
    // Fuse score: 0 = perfect match, 1 = no match; convert to 0-1 scale (1 = perfect)
    const normalizedScore = 1 - (result.score ?? 0)
    return { slug: path, title: item.label ?? '', score: normalizedScore }
  })

  // If semantic search hasn't completed or failed, return keyword-only results
  if (!hasSemanticSearchRun.value || semanticError.value) {
    return fuseResults.map(r => r.item).slice(0, 15)
  }

  // Merge keyword and semantic results using hybrid scoring
  const hybridResults = mergeSearchResults(keywordResults, semanticResults.value)

  // Convert back to CommandPaletteItem format, preserving original item data
  return hybridResults.slice(0, 15).map((hr) => {
    const existing = contentItemsMap.value.get(hr.slug)
    if (existing) return existing

    // Semantic-only result - create new item
    return {
      id: hr.slug,
      label: hr.title,
      description: '',
      icon: 'i-lucide-file-text',
      to: hr.slug,
    }
  })
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

// Content group for CommandPalette - uses hybrid search when searching
const contentGroup = computed<CommandPaletteGroup | null>(() => {
  const isSearching = Boolean(debouncedSearchTerm.value)

  // When searching, use hybrid results with ignoreFilter to bypass built-in Fuse
  if (isSearching && hybridContentItems.value.length) {
    return {
      id: 'content',
      label: semanticLoading.value ? 'Notes (loading semantic...)' : 'Notes',
      items: hybridContentItems.value,
      ignoreFilter: true,
    }
  }

  // Not searching - show all items with built-in Fuse filtering
  if (contentItems.value.length) {
    return {
      id: 'content',
      label: 'Notes',
      items: contentItems.value,
    }
  }

  return null
})

// Combined groups for CommandPalette
const groups = computed<CommandPaletteGroup[]>(() => {
  const result: CommandPaletteGroup[] = []

  if (contentGroup.value) {
    result.push(contentGroup.value)
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
    keys: [
      { name: 'label', weight: 1 },
      { name: 'description', weight: 0.7 },
      { name: 'keywords', weight: 0.9 }, // tags, type, authors
    ],
    threshold: 0.4,
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
        v-model:search-term="searchTerm"
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
