<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useAsyncData, useSeoMeta, defineShortcuts, navigateTo, queryCollection, queryCollectionSearchSections } from '#imports'
import { NuxtLink, UInput, UKbd } from '#components'
import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'

interface SearchSection {
  id: string
  title: string
  titles: string[]
  content: string
  level: number
}

interface SearchResult {
  id: string
  path: string
  title: string
  snippet: string
  highlightedSnippet: string
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

// Fetch all content for default display (when no search term)
const { data: allContent } = await useAsyncData('all-content', () => {
  return queryCollection('content').order('date', 'DESC').all()
})

// Create Fuse instance for full-text search
const fuse = computed(() => {
  if (!searchSections.value) return null
  return new Fuse(searchSections.value, {
    keys: ['title', 'content', 'titles'],
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
  result: FuseResult<SearchSection>,
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

// Helper: Create search result from fuse result
function createSearchResult(result: FuseResult<SearchSection>, searchTerm: string): SearchResult {
  const section = result.item
  const path = section.id.split('#')[0] ?? section.id
  const title = section.titles?.[0] || section.title || path
  const { snippet, highlightedSnippet } = extractSnippetFromMatch(result, searchTerm)

  return { id: path, path, title, snippet, highlightedSnippet }
}

// Group sections by document and return search results
function processSearchResults(fuseResults: FuseResult<SearchSection>[]): SearchResult[] {
  const resultMap = new Map<string, SearchResult>()

  for (const result of fuseResults) {
    const path = result.item.id.split('#')[0] ?? result.item.id
    if (!resultMap.has(path)) {
      resultMap.set(path, createSearchResult(result, debouncedSearch.value))
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

useSeoMeta({
  title: 'Search - Second Brain',
})
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
          <h3 class="font-medium">
            {{ result.title }}
          </h3>
          <p
            v-if="result.highlightedSnippet"
            class="search-snippet mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-2"
            v-html="result.highlightedSnippet"
          />
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
