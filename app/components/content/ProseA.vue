<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import { NuxtLink, UPopover, UBadge } from '#components'
import { usePrefetchContent } from '~/composables/usePrefetchContent'
import type { ContentType } from '~/constants/contentTypes'
import { CONTENT_TYPE_BADGE_COLORS } from '~/constants/contentTypeColors'

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

// Detect which collection to query based on URL prefix
type CollectionType = 'content' | 'authors' | 'podcasts' | 'newsletters' | 'tweets' | 'pages'
const collectionType = computed((): CollectionType => {
  const path = slug.value || ''
  if (path.startsWith('authors/')) return 'authors'
  if (path.startsWith('podcasts/')) return 'podcasts'
  if (path.startsWith('newsletters/')) return 'newsletters'
  if (path.startsWith('tweets/')) return 'tweets'
  if (path.startsWith('pages/')) return 'pages'
  return 'content'
})

// Fetch preview data for wiki-links from the appropriate collection
const { data: linkData } = await useAsyncData(
  `wiki-link-${slug.value}`,
  async () => {
    if (!isWikiLink.value || !slug.value)
      return null

    const collection = collectionType.value

    if (collection === 'authors') {
      return queryCollection('authors')
        .select('name', 'bio', 'avatar', 'website', 'stem')
        .where('stem', '=', slug.value)
        .first()
    }
    if (collection === 'podcasts') {
      return queryCollection('podcasts')
        .select('name', 'description', 'artwork', 'stem')
        .where('stem', '=', slug.value)
        .first()
    }
    if (collection === 'newsletters') {
      return queryCollection('newsletters')
        .select('name', 'description', 'logo', 'stem')
        .where('stem', '=', slug.value)
        .first()
    }
    if (collection === 'tweets') {
      return queryCollection('tweets')
        .select('title', 'tweetText', 'stem')
        .where('stem', '=', slug.value)
        .first()
    }
    if (collection === 'pages') {
      return queryCollection('pages')
        .select('title', 'description', 'stem')
        .where('stem', '=', slug.value)
        .first()
    }

    // Default: content collection
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


// Normalize preview data from different collection schemas
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

interface PreviewData {
  title: string
  summary?: string
  image?: string
  badge?: { label: string, color: BadgeColor }
  tags?: string[]
  website?: string
}

// Type guard for object with string keys
function isRecord(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object'
}

// Type guard for ContentType
function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && value in CONTENT_TYPE_BADGE_COLORS
}

// Helper to safely get string property
function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key]
  return typeof value === 'string' ? value : undefined
}

// Helper to safely get string array property
function getStringArray(obj: Record<string, unknown>, key: string): string[] | undefined {
  const value = obj[key]
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : undefined
}

// Collection-specific preview builders to reduce complexity
function buildAuthorPreview(data: Record<string, unknown>): PreviewData {
  return {
    title: getString(data, 'name') ?? '',
    summary: getString(data, 'bio'),
    image: getString(data, 'avatar'),
    website: getString(data, 'website'),
    badge: { label: 'Author', color: 'primary' },
  }
}

function buildPodcastPreview(data: Record<string, unknown>): PreviewData {
  return {
    title: getString(data, 'name') ?? '',
    summary: getString(data, 'description'),
    image: getString(data, 'artwork'),
    badge: { label: 'Podcast', color: 'secondary' },
  }
}

function buildNewsletterPreview(data: Record<string, unknown>): PreviewData {
  return {
    title: getString(data, 'name') ?? '',
    summary: getString(data, 'description'),
    image: getString(data, 'logo'),
    badge: { label: 'Newsletter', color: 'info' },
  }
}

function buildTweetPreview(data: Record<string, unknown>): PreviewData {
  return {
    title: getString(data, 'title') ?? '',
    summary: getString(data, 'tweetText'),
    badge: { label: 'Tweet', color: 'info' },
  }
}

function buildPagePreview(data: Record<string, unknown>): PreviewData {
  return {
    title: getString(data, 'title') ?? '',
    summary: getString(data, 'description'),
    badge: { label: 'Page', color: 'neutral' },
  }
}

function buildContentPreview(data: Record<string, unknown>): PreviewData {
  const contentType = getString(data, 'type')
  return {
    title: getString(data, 'title') ?? '',
    summary: getString(data, 'summary'),
    badge: isContentType(contentType) ? { label: contentType, color: CONTENT_TYPE_BADGE_COLORS[contentType] } : undefined,
    tags: getStringArray(data, 'tags'),
  }
}

const previewBuilders: Record<CollectionType, (data: Record<string, unknown>) => PreviewData> = {
  authors: buildAuthorPreview,
  podcasts: buildPodcastPreview,
  newsletters: buildNewsletterPreview,
  tweets: buildTweetPreview,
  pages: buildPagePreview,
  content: buildContentPreview,
}

const previewData = computed((): PreviewData | null => {
  if (!linkData.value || !isRecord(linkData.value)) return null
  return previewBuilders[collectionType.value](linkData.value)
})

// Prefetch full page data on hover (before popover opens)
const { prefetch } = usePrefetchContent()

function handleMouseEnter() {
  if (isWikiLink.value && props.href) {
    prefetch(props.href)
  }
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
    @mouseenter="handleMouseEnter"
    @focus="handleMouseEnter"
  >
    <NuxtLink
      :to="href"
      :class="linkClass"
    >
      <slot />
    </NuxtLink>

    <template #content>
      <div class="w-72 p-3 space-y-2">
        <!-- Type/collection badge -->
        <UBadge
          v-if="previewData?.badge"
          :label="previewData.badge.label"
          :color="previewData.badge.color"
          variant="subtle"
          size="xs"
        />

        <!-- Title -->
        <p class="font-semibold text-sm leading-snug">
          {{ previewData?.title }}
        </p>

        <!-- Summary/bio/description -->
        <p
          v-if="previewData?.summary"
          class="text-xs text-muted line-clamp-3"
        >
          {{ previewData.summary }}
        </p>

        <!-- Website (for authors) -->
        <a
          v-if="previewData?.website"
          :href="previewData.website"
          target="_blank"
          rel="noopener"
          class="text-xs text-primary hover:underline block"
        >
          {{ previewData.website }}
        </a>

        <!-- Tags (for content collection) -->
        <div
          v-if="previewData?.tags?.length"
          class="flex gap-1 flex-wrap pt-1"
        >
          <UBadge
            v-for="tag in previewData.tags.slice(0, 4)"
            :key="tag"
            :label="tag"
            color="neutral"
            variant="outline"
            size="xs"
          />
          <span
            v-if="previewData.tags.length > 4"
            class="text-xs text-muted"
          >
            +{{ previewData.tags.length - 4 }}
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
