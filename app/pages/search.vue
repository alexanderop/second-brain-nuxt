<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useAsyncData, defineShortcuts, navigateTo, queryCollection, queryCollectionSearchSections } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { NuxtLink, UInput, UKbd, UAvatar } from '#components'
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

interface SearchResult {
  id: string
  type: 'content' | 'author'
  path: string
  title: string
  snippet: string
  highlightedSnippet: string
  // Author fields
  author?: Author
  highlightedName?: string
}

const searchTerm = ref('')
const debouncedSearch = ref('')

watchDebounced(
  searchTerm,
  (value) => {
    debouncedSearch.value = value
  },
  { debounce: 300 },
)

// Fetch search sections with full body content
const { data: searchSections } = await useAsyncData(
  'search-sections',
  () => queryCollectionSearchSections('content'),
)

// Fetch authors for search
const { data: authors } = await useAsyncData(
  'search-authors',
  () => queryCollection('authors').select('name', 'slug', 'avatar').all(),
)

// Fetch all content for default display (when no search term)
const { data: allContent } = await useAsyncData('all-content', () => {
  return queryCollection('content').order('date', 'DESC').all()
})

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

// Extract snippet around match with context
function getSnippet(content: string, term: string, contextChars = 60): string {
  const lowerContent = content.toLowerCase()
  const lowerTerm = term.toLowerCase()
  const index = lowerContent.indexOf(lowerTerm)

  if (index === -1) return content.slice(0, 150)

  const start = Math.max(0, index - contextChars)
  const end = Math.min(content.length, index + term.length + contextChars)

  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet += '...'

  return snippet
}

// Highlight matched terms in text
function highlightMatch(text: string, term: string): string {
  if (!term) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-[var(--ui-primary)]/20 text-[var(--ui-primary)] rounded px-0.5">$1</mark>')
}

// Helper: Extract snippet and highlighted version from match results
function extractSnippetFromMatch(
  result: FuseResult<SearchableItem>,
  searchTerm: string,
): { snippet: string, highlightedSnippet: string } {
  const contentMatch = result.matches?.find(m => m.key === 'content')
  const titleMatch = result.matches?.find(m => m.key === 'title')

  if (contentMatch?.value) {
    const snippet = getSnippet(contentMatch.value, searchTerm)
    return { snippet, highlightedSnippet: highlightMatch(snippet, searchTerm) }
  }

  if (titleMatch?.value) {
    const snippet = result.item.content?.slice(0, 150) ?? ''
    return { snippet, highlightedSnippet: snippet }
  }

  return { snippet: '', highlightedSnippet: '' }
}

// Helper: Create content search result from fuse result
function createContentResult(result: FuseResult<SearchableItem>, searchTerm: string): SearchResult {
  const item = result.item
  const path = (item.id ?? '').split('#')[0] || item.id || ''
  const title = item.titles?.[0] || item.title || path
  const { snippet, highlightedSnippet } = extractSnippetFromMatch(result, searchTerm)

  return { id: path, type: 'content', path, title, snippet, highlightedSnippet }
}

// Helper: Create author search result
function createAuthorResult(item: SearchableItem, searchTerm: string): SearchResult {
  const authorSlug = item.slug ?? ''
  const authorName = item.name ?? ''
  return {
    id: `author:${authorSlug}`,
    type: 'author',
    path: `/authors/${encodeURIComponent(authorSlug)}`,
    title: authorName,
    snippet: 'Author',
    highlightedSnippet: 'Author',
    author: { name: authorName, slug: authorSlug, avatar: item.avatar },
    highlightedName: highlightMatch(authorName, searchTerm),
  }
}

// Group sections by document and return search results
function processSearchResults(fuseResults: FuseResult<SearchableItem>[]): SearchResult[] {
  const resultMap = new Map<string, SearchResult>()

  for (const result of fuseResults) {
    const item = result.item

    if (item.type === 'author') {
      const key = `author:${item.slug ?? ''}`
      if (!resultMap.has(key)) {
        resultMap.set(key, createAuthorResult(item, debouncedSearch.value))
      }
      continue
    }

    const path = (item.id ?? '').split('#')[0] || item.id || ''
    if (!resultMap.has(path)) {
      resultMap.set(path, createContentResult(result, debouncedSearch.value))
    }
  }

  return Array.from(resultMap.values())
}

// Computed search results
const results = computed<SearchResult[]>(() => {
  if (!debouncedSearch.value) return []
  if (!fuse.value) return []

  const fuseResults = fuse.value.search(debouncedSearch.value)
  return processSearchResults(fuseResults)
})

// Default content when no search term
const defaultContent = computed(() => {
  return allContent.value?.slice(0, 10) ?? []
})

const selectedIndex = ref(-1)

// List navigation shortcuts
defineShortcuts({
  'j': () => {
    const length = debouncedSearch.value ? results.value.length : defaultContent.value.length
    if (length === 0) return
    selectedIndex.value = Math.min(selectedIndex.value + 1, length - 1)
  },
  'k': () => {
    const length = debouncedSearch.value ? results.value.length : defaultContent.value.length
    if (length === 0) return
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  },
  'enter': () => {
    if (selectedIndex.value < 0) return
    if (debouncedSearch.value && results.value.length) {
      const item = results.value[selectedIndex.value]
      if (item) navigateTo(item.path)
      return
    }
    const item = defaultContent.value[selectedIndex.value]
    if (item) navigateTo(`/${item.stem}`)
  },
})

// Reset selection when search changes
watch(debouncedSearch, () => {
  selectedIndex.value = -1
})

usePageTitle('Search')
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Search
    </h1>

    <UInput
      v-model="searchTerm"
      placeholder="Search content..."
      icon="i-lucide-search"
      size="lg"
      autofocus
      class="mb-8"
    />

    <!-- Search results -->
    <div v-if="debouncedSearch && results.length">
      <p class="text-sm text-[var(--ui-text-muted)] mb-4">
        {{ results.length }} result{{ results.length === 1 ? '' : 's' }}
      </p>
      <div class="space-y-4">
        <NuxtLink
          v-for="(result, index) in results"
          :key="result.id"
          :to="result.path"
          class="block p-4 rounded-lg border border-[var(--ui-border)] transition-colors"
          :class="index === selectedIndex ? 'bg-[var(--ui-bg-muted)]' : 'hover:bg-[var(--ui-bg-muted)]'"
        >
          <!-- Author result -->
          <div v-if="result.type === 'author'" class="flex items-center gap-3">
            <UAvatar
              :src="result.author?.avatar"
              :alt="result.author?.name"
              size="sm"
              class="shrink-0"
            />
            <div>
              <h3
                class="font-medium"
                v-html="result.highlightedName"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Author
              </p>
            </div>
          </div>

          <!-- Content result -->
          <template v-else>
            <h3 class="font-medium">
              {{ result.title }}
            </h3>
            <p
              v-if="result.highlightedSnippet"
              class="search-snippet mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-2"
              v-html="result.highlightedSnippet"
            />
          </template>
        </NuxtLink>
      </div>
    </div>

    <!-- No results -->
    <div v-else-if="debouncedSearch" class="text-center py-8 text-[var(--ui-text-muted)]">
      No results found for "{{ debouncedSearch }}"
    </div>

    <!-- Default content when not searching -->
    <div v-else-if="defaultContent.length">
      <p class="text-sm text-[var(--ui-text-muted)] mb-4">
        Recent content
      </p>
      <div class="space-y-4">
        <NuxtLink
          v-for="(item, index) in defaultContent"
          :key="item.id"
          :to="`/${item.stem}`"
          class="block p-4 rounded-lg border border-[var(--ui-border)] transition-colors"
          :class="index === selectedIndex ? 'bg-[var(--ui-bg-muted)]' : 'hover:bg-[var(--ui-bg-muted)]'"
        >
          <h3 class="font-medium">
            {{ item.title }}
          </h3>
          <p v-if="item.summary" class="mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-2">
            {{ item.summary }}
          </p>
        </NuxtLink>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
      <p>Start typing to search your knowledge base</p>
      <p class="text-sm mt-2">
        Use <UKbd>⌘K</UKbd> anywhere to open quick search
      </p>
    </div>
  </div>
</template>
