<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useRoute, useAsyncData, navigateTo, queryCollectionSearchSections, queryCollection } from '#imports'
import { UModal, UIcon, UKbd, UAvatar } from '#components'
import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'

interface SearchSection {
  id: string
  title: string
  titles: string[]
  content: string
  level: number
}

interface Author {
  name: string
  slug: string
  avatar?: string
}

interface SearchableItem {
  type: 'content' | 'author'
  // Content fields
  id?: string
  title?: string
  content?: string
  titles?: string[]
  level?: number
  // Author fields
  name?: string
  slug?: string
  avatar?: string
}

interface SearchResultItem {
  id: string
  type: 'content' | 'author'
  // Content fields
  section?: SearchSection
  breadcrumb?: string
  snippet?: string
  highlightedBreadcrumb?: string
  highlightedSnippet?: string
  // Author fields
  author?: Author
  highlightedName?: string
  // Common
  to: string
}

const open = defineModel<boolean>('open', { default: false })
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchTerm = ref('')
const debouncedSearch = ref('')
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

// Close modal when route changes
watch(() => route.fullPath, () => {
  open.value = false
})

// Focus search input when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
})

// Debounce search
watchDebounced(
  searchTerm,
  (value) => {
    debouncedSearch.value = value
  },
  { debounce: 200 },
)

// Create Fuse instance for full-text search (content + authors)
const fuse = computed(() => {
  const items: SearchableItem[] = []

  // Add content sections
  if (searchSections.value) {
    for (const section of searchSections.value) {
      items.push({ type: 'content', ...section })
    }
  }

  // Add authors
  if (authors.value) {
    for (const author of authors.value) {
      items.push({ type: 'author', ...author })
    }
  }

  if (items.length === 0) return null

  return new Fuse(items, {
    keys: [
      { name: 'title', weight: 1 },
      { name: 'content', weight: 0.7 },
      { name: 'titles', weight: 0.8 },
      { name: 'name', weight: 1 }, // Author name
    ],
    includeMatches: true,
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
})

// Build breadcrumb path from section
function buildBreadcrumb(section: SearchSection): string {
  const parts = [...(section.titles || []), section.title].filter(Boolean)
  return parts.join(' > ')
}

// Get snippet around match with context
function getSnippet(content: string, term: string, contextChars = 50): string {
  if (!content) return ''
  const lowerContent = content.toLowerCase()
  const lowerTerm = term.toLowerCase()
  const index = lowerContent.indexOf(lowerTerm)

  if (index === -1) return content.slice(0, 100)

  const start = Math.max(0, index - contextChars)
  const end = Math.min(content.length, index + term.length + contextChars)

  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet += '...'

  return snippet
}

// Highlight matched terms in text
function highlightMatch(text: string, term: string): string {
  if (!term || !text) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-[var(--ui-primary)]/20 text-[var(--ui-primary)] rounded px-0.5">$1</mark>')
}

// Create author search result
function createAuthorResult(item: SearchableItem, searchTerm: string): SearchResultItem {
  const authorSlug = item.slug ?? ''
  const authorName = item.name ?? ''
  return {
    id: `author:${authorSlug}`,
    type: 'author',
    author: { name: authorName, slug: authorSlug, avatar: item.avatar },
    highlightedName: highlightMatch(authorName, searchTerm),
    to: `/authors/${encodeURIComponent(authorSlug)}`,
  }
}

// Create content search result
function createContentResult(item: SearchableItem, searchTerm: string): SearchResultItem {
  const sectionId = item.id ?? ''
  const section: SearchSection = {
    id: sectionId,
    title: item.title ?? '',
    titles: item.titles ?? [],
    content: item.content ?? '',
    level: item.level ?? 0,
  }
  const breadcrumb = buildBreadcrumb(section)
  const snippet = getSnippet(section.content, searchTerm)
  return {
    id: sectionId,
    type: 'content',
    section,
    breadcrumb,
    snippet,
    highlightedBreadcrumb: highlightMatch(breadcrumb, searchTerm),
    highlightedSnippet: highlightMatch(snippet, searchTerm),
    to: sectionId,
  }
}

// Process Fuse results into items
function processResults(fuseResults: FuseResult<SearchableItem>[]): SearchResultItem[] {
  const seen = new Set<string>()
  const items: SearchResultItem[] = []

  for (const result of fuseResults) {
    const item = result.item
    const isAuthor = item.type === 'author'
    const key = isAuthor ? `author:${item.slug ?? ''}` : (item.id ?? '')

    if (seen.has(key)) continue
    seen.add(key)

    const resultItem = isAuthor
      ? createAuthorResult(item, debouncedSearch.value)
      : createContentResult(item, debouncedSearch.value)
    items.push(resultItem)

    if (items.length >= 15) break
  }

  return items
}

// Computed search results
const searchResults = computed<SearchResultItem[]>(() => {
  if (!debouncedSearch.value || !fuse.value) return []
  const fuseResults = fuse.value.search(debouncedSearch.value)
  return processResults(fuseResults)
})

// Default items when not searching (recent/all sections)
const defaultItems = computed(() => {
  if (!searchSections.value) return []
  // Show first sections (document titles)
  const seen = new Set<string>()
  const items: SearchResultItem[] = []

  for (const section of searchSections.value) {
    if (!section.id) continue
    const path = section.id.split('#')[0] || ''
    if (seen.has(path)) continue
    seen.add(path)

    const breadcrumb = buildBreadcrumb(section)
    const snippetText = section.content?.slice(0, 100) || ''
    items.push({
      id: section.id,
      type: 'content',
      section,
      breadcrumb,
      snippet: snippetText,
      highlightedBreadcrumb: breadcrumb,
      highlightedSnippet: snippetText,
      to: path, // Navigate to document for defaults
    })

    if (items.length >= 10) break
  }

  return items
})

// Items to display
const displayItems = computed(() => {
  return debouncedSearch.value ? searchResults.value : defaultItems.value
})

function onSelect(item: SearchResultItem) {
  if (item.to) {
    navigateTo(item.to)
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="flex flex-col h-96">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--ui-border)]">
          <UIcon name="i-lucide-search" class="text-[var(--ui-text-muted)]" />
          <input
            ref="searchInputRef"
            v-model="searchTerm"
            type="text"
            placeholder="Search..."
            aria-label="Search"
            class="flex-1 bg-transparent outline-none text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)]"
          >
          <UKbd>Esc</UKbd>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="displayItems.length" class="py-2">
            <button
              v-for="item in displayItems"
              :key="item.id"
              data-search-result
              class="w-full px-4 py-3 text-left hover:bg-[var(--ui-bg-elevated)] focus:bg-[var(--ui-bg-elevated)] focus:outline-none transition-colors"
              @click="onSelect(item)"
            >
              <div class="flex items-start gap-2">
                <!-- Author result -->
                <template v-if="item.type === 'author'">
                  <UAvatar
                    :src="item.author?.avatar"
                    :alt="item.author?.name"
                    size="xs"
                    class="mt-0.5 shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <div
                      class="text-sm font-medium text-[var(--ui-text)] truncate"
                      v-html="item.highlightedName"
                    />
                    <div class="text-xs text-[var(--ui-text-muted)]">
                      Author
                    </div>
                  </div>
                </template>

                <!-- Content result -->
                <template v-else>
                  <UIcon name="i-lucide-hash" class="mt-1 text-[var(--ui-text-muted)] shrink-0" />
                  <div class="min-w-0 flex-1">
                    <div
                      data-breadcrumb
                      class="text-sm font-medium text-[var(--ui-text)] truncate"
                      v-html="item.highlightedBreadcrumb"
                    />
                    <div
                      v-if="item.snippet"
                      data-search-snippet
                      class="text-xs text-[var(--ui-text-muted)] mt-1 line-clamp-2"
                      v-html="item.highlightedSnippet"
                    />
                  </div>
                </template>
              </div>
            </button>
          </div>

          <div v-else-if="debouncedSearch" class="flex items-center justify-center h-full text-[var(--ui-text-muted)]">
            No results found for "{{ debouncedSearch }}"
          </div>

          <div v-else class="flex items-center justify-center h-full text-[var(--ui-text-muted)]">
            Start typing to search...
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
