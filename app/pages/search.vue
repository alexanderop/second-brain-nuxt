<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useAsyncData, defineShortcuts, navigateTo, queryCollection, queryCollectionSearchSections } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { NuxtLink, UInput, UKbd, UAvatar } from '#components'
import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'
import { useDebouncedSemanticSearch } from '~/composables/useDebouncedSemanticSearch'
import { mergeSearchResults, type KeywordResult, type HybridResult } from '~/utils/hybridSearch'
import { getSnippet, highlightMatch } from '~/utils/searchResultTransformers'

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
  // Metadata fields (enriched from content collection)
  tags?: string[]
  contentType?: string
  authorSlugs?: string[]
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
  { debounce: 250 },
)

// Semantic search with debouncing and proper async handling
const {
  results: semanticResults,
  hasSearchRun: hasSemanticSearchRun,
  isLoading: semanticLoading,
  error: semanticError,
} = useDebouncedSemanticSearch(debouncedSearch)

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

// Build a lookup map: path → { tags, type, authors }
const contentMetadata = computed(() => {
  if (!allContent.value) return new Map<string, { tags: string[], type: string, authors: string[] }>()
  return new Map(allContent.value.map(c => [
    `/${c.stem}`,
    { tags: c.tags ?? [], type: c.type, authors: c.authors ?? [] },
  ]))
})

// Fuse.js configuration for full-text search
const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 1 },
    { name: 'content', weight: 0.7 },
    { name: 'titles', weight: 0.8 },
    { name: 'name', weight: 1 }, // Author name
    { name: 'tags', weight: 0.9 },
    { name: 'contentType', weight: 0.6 },
    { name: 'authorSlugs', weight: 0.8 },
  ],
  includeMatches: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

// Helper to enrich section with metadata
function enrichSection(
  section: SearchSection,
  metadataMap: Map<string, { tags: string[], type: string, authors: string[] }>,
): SearchableItem {
  const path = (section.id ?? '').split('#')[0] ?? ''
  const meta = metadataMap.get(path)
  return {
    type: 'content',
    ...section,
    tags: meta?.tags,
    contentType: meta?.type,
    authorSlugs: meta?.authors,
  }
}

// Create Fuse instance for full-text search (content + authors)
const fuse = computed(() => {
  const sections = searchSections.value ?? []
  const authorList = authors.value ?? []

  const contentItems = sections.map(s => enrichSection(s, contentMetadata.value))
  const authorItems: SearchableItem[] = authorList.map(a => ({ type: 'author', ...a }))
  const items = [...contentItems, ...authorItems]

  return items.length > 0 ? new Fuse(items, FUSE_OPTIONS) : null
})

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

// Helper to process a single author result
function processAuthorResult(
  item: SearchableItem,
  seenPaths: Set<string>,
  authorResults: SearchResult[],
): void {
  const key = `author:${item.slug ?? ''}`
  if (!seenPaths.has(key)) {
    seenPaths.add(key)
    authorResults.push(createAuthorResult(item, debouncedSearch.value))
  }
}

// Helper to process a single content result
function processContentResult(
  result: FuseResult<SearchableItem>,
  seenPaths: Set<string>,
  keywordResults: KeywordResult[],
  fuseMap: Map<string, FuseResult<SearchableItem>>,
): void {
  const item = result.item
  const path = (item.id ?? '').split('#')[0] || item.id || ''
  if (seenPaths.has(path)) return
  seenPaths.add(path)

  // Convert Fuse score (0 = perfect match, 1 = no match) to 0-1 scale (1 = perfect)
  const normalizedScore = 1 - (result.score ?? 0)
  const title = item.titles?.[0] || item.title || path

  keywordResults.push({ slug: path, title, score: normalizedScore })
  fuseMap.set(path, result)
}

// Convert Fuse results to keyword results for hybrid scoring
function fuseToKeywordResults(fuseResults: FuseResult<SearchableItem>[]): { keywordResults: KeywordResult[], authorResults: SearchResult[], fuseMap: Map<string, FuseResult<SearchableItem>> } {
  const keywordResults: KeywordResult[] = []
  const authorResults: SearchResult[] = []
  const fuseMap = new Map<string, FuseResult<SearchableItem>>()
  const seenPaths = new Set<string>()

  for (const result of fuseResults) {
    if (result.item.type === 'author') {
      processAuthorResult(result.item, seenPaths, authorResults)
      continue
    }
    processContentResult(result, seenPaths, keywordResults, fuseMap)
  }

  return { keywordResults, authorResults, fuseMap }
}

// Convert hybrid results back to SearchResult format
function hybridToSearchResults(
  hybridResults: HybridResult[],
  fuseMap: Map<string, FuseResult<SearchableItem>>,
  searchTerm: string,
): SearchResult[] {
  return hybridResults.map((hr) => {
    const fuseResult = fuseMap.get(hr.slug)

    // If we have a fuse result, use its snippet info
    if (fuseResult) {
      const { snippet, highlightedSnippet } = extractSnippetFromMatch(fuseResult, searchTerm)
      return {
        id: hr.slug,
        type: 'content' as const,
        path: hr.slug,
        title: hr.title,
        snippet,
        highlightedSnippet,
      }
    }

    // Semantic-only result - no snippet available
    return {
      id: hr.slug,
      type: 'content' as const,
      path: hr.slug,
      title: hr.title,
      snippet: '',
      highlightedSnippet: '',
    }
  })
}

// Computed search results with hybrid scoring
const results = computed<SearchResult[]>(() => {
  if (!debouncedSearch.value) return []
  if (!fuse.value) return []

  const fuseResults = fuse.value.search(debouncedSearch.value)
  const { keywordResults, authorResults, fuseMap } = fuseToKeywordResults(fuseResults)

  // If semantic search hasn't completed yet or failed, use keyword-only results
  if (!hasSemanticSearchRun.value || semanticError.value) {
    // Fall back to original keyword-only processing
    const keywordOnlyResults = keywordResults.map((kr) => {
      const fuseResult = fuseMap.get(kr.slug)
      if (fuseResult) {
        const { snippet, highlightedSnippet } = extractSnippetFromMatch(fuseResult, debouncedSearch.value)
        return {
          id: kr.slug,
          type: 'content' as const,
          path: kr.slug,
          title: kr.title,
          snippet,
          highlightedSnippet,
        }
      }
      return {
        id: kr.slug,
        type: 'content' as const,
        path: kr.slug,
        title: kr.title,
        snippet: '',
        highlightedSnippet: '',
      }
    })
    return [...authorResults, ...keywordOnlyResults]
  }

  // Merge keyword and semantic results using hybrid scoring
  const hybridResults = mergeSearchResults(keywordResults, semanticResults.value)

  // Convert back to SearchResult format
  const contentResults = hybridToSearchResults(hybridResults, fuseMap, debouncedSearch.value)

  // Authors first, then content sorted by hybrid score
  return [...authorResults, ...contentResults]
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

    <!-- Semantic search loading indicator -->
    <div v-if="debouncedSearch && semanticLoading" class="flex items-center gap-2 text-sm text-[var(--ui-text-muted)] mb-4">
      <span class="i-lucide-loader-2 animate-spin" />
      Loading semantic search...
    </div>

    <!-- Search results -->
    <div v-if="debouncedSearch && results.length">
      <p class="text-sm text-[var(--ui-text-muted)] mb-4">
        {{ results.length }} result{{ results.length === 1 ? '' : 's' }}
        <span v-if="semanticLoading" class="ml-2">(semantic search loading...)</span>
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
