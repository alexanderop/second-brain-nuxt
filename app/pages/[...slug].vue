<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, useAsyncData, useSeoMeta, createError, queryCollection, defineShortcuts, useRuntimeConfig } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { ContentRenderer, UContentToc } from '#components'
import ContentHeader from '~/components/ContentHeader.vue'
import ContentBacklinksSection from '~/components/ContentBacklinksSection.vue'
import YouTubePlayer from '~/components/YouTubePlayer.vue'
import BookCover from '~/components/BookCover.vue'
import GitHubRepoCard from '~/components/GitHubRepoCard.vue'
import NoteGraph from '~/components/NoteGraph.vue'
import AuthorPickerModal from '~/components/AuthorPickerModal.vue'
import { useBacklinks } from '~/composables/useBacklinks'
import { useMentions } from '~/composables/useMentions'
import { useFocusMode } from '~/composables/useFocusMode'
import { useTocVisibility } from '~/composables/useTocVisibility'
import { useAuthorShortcut } from '~/composables/useAuthorShortcut'
import type { NewsletterItem, PodcastItem } from '~/types/content'

interface PageWithPodcast {
  podcast?: string
  guests?: string[]
}

interface PageWithNewsletter {
  newsletter?: string
}

function isPodcastItem(p: unknown): p is PodcastItem {
  return typeof p === 'object' && p !== null && 'slug' in p && 'name' in p && 'hosts' in p
}

function isNewsletterItem(n: unknown): n is NewsletterItem {
  return typeof n === 'object' && n !== null && 'slug' in n && 'name' in n && 'authors' in n
}

function hasPagePodcastFields(p: unknown): p is PageWithPodcast {
  return typeof p === 'object' && p !== null
}

function hasPageNewsletterFields(p: unknown): p is PageWithNewsletter {
  return typeof p === 'object' && p !== null
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { isFocusMode } = useFocusMode()
const { isTocVisible, toggle: toggleToc } = useTocVisibility()
const authorPickerOpen = ref(false)
const authorPickerAuthors = ref<string[]>([])

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

const { data: page } = await useAsyncData(
  `page-${route.path}`,
  () => queryCollection('content').path(route.path).first(),
  {
    // Use prefetched data from cache if available (from hover prefetch)
    getCachedData: (key, nuxtApp) =>
      nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  },
)

const tocLinks = computed(() => page.value?.body?.toc?.links ?? [])

if (!page.value) {
  throw createError({ status: 404, statusText: 'Page not found' })
}

// Get slug from path (remove leading slash)
const slug = computed(() => route.path.replace(/^\//, ''))
const { backlinks } = useBacklinks(slug.value)
const { mentions } = useMentions(slug.value, page.value?.title ?? '')

// Fetch podcast data if this is a podcast episode
const podcastSlug = computed(() => {
  if (hasPagePodcastFields(page.value)) return page.value.podcast
  return undefined
})

const { data: podcast } = await useAsyncData(
  `page-podcast-${podcastSlug.value ?? 'none'}`,
  async () => {
    if (!podcastSlug.value) return null
    return queryCollection('podcasts')
      .where('slug', '=', podcastSlug.value)
      .first()
  },
)

const typedPodcast = computed(() => {
  if (isPodcastItem(podcast.value)) return podcast.value
  return null
})

async function fetchHostAuthor(hostSlug: string) {
  const author = await queryCollection('authors')
    .where('slug', '=', hostSlug)
    .first()
  return author
    ? { slug: hostSlug, name: author.name }
    : { slug: hostSlug, name: hostSlug }
}

const { data: podcastHosts } = await useAsyncData(
  `page-podcast-hosts-${podcastSlug.value ?? 'none'}`,
  async () => {
    const hosts = typedPodcast.value?.hosts
    if (!hosts?.length) return []
    return Promise.all(hosts.map(fetchHostAuthor))
  },
)

function getPageGuests(p: typeof page.value): string[] | undefined {
  return hasPagePodcastFields(p) ? p.guests : undefined
}

// Fetch newsletter data if this is a newsletter article
const newsletterSlug = computed(() => {
  if (hasPageNewsletterFields(page.value)) return page.value.newsletter
  return undefined
})

const { data: newsletter } = await useAsyncData(
  `page-newsletter-${newsletterSlug.value ?? 'none'}`,
  async () => {
    if (!newsletterSlug.value) return null
    return queryCollection('newsletters')
      .where('slug', '=', newsletterSlug.value)
      .first()
  },
)

const typedNewsletter = computed(() => {
  if (isNewsletterItem(newsletter.value)) return newsletter.value
  return null
})

// Content header data (extracted to avoid inline object creation on each render)
const headerContent = computed(() => ({
  slug: slug.value,
  title: page.value?.title ?? '',
  type: page.value?.type ?? 'note',
  url: page.value?.url,
  tags: page.value?.tags,
  authors: page.value?.authors,
  date: page.value?.date,
  rating: page.value?.rating,
  guests: getPageGuests(page.value),
}))

// Authors for the shortcut
const pageAuthors = computed(() => page.value?.authors)
const { handleShortcut: handleAuthorShortcut } = useAuthorShortcut(pageAuthors)

// Fetch note graph data for mini-graph visualization
const { data: noteGraph } = await useAsyncData(
  `note-graph-${slug.value}`,
  () => $fetch(`/api/note-graph/${slug.value}`),
)

function navigateToNote(targetSlug: string) {
  router.push(`/${targetSlug}`)
}

usePageTitle(() => page.value?.title ?? '')

useSeoMeta({
  description: () => page.value?.summary ?? '',
  ogTitle: () => page.value?.title ?? 'Second Brain',
  ogDescription: () => page.value?.summary ?? '',
  ogImage: () => `${config.public.siteUrl}/og/${slug.value}.png`,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: () => page.value?.title ?? 'Second Brain',
  twitterDescription: () => page.value?.summary ?? '',
  twitterImage: () => `${config.public.siteUrl}/og/${slug.value}.png`,
})

defineShortcuts({
  'o': () => {
    if (page.value?.url) {
      window.open(page.value.url, '_blank')
    }
  },
  ']': () => {
    toggleToc()
  },
  'a': () => {
    const action = handleAuthorShortcut()
    if (action.type === 'multiple') {
      authorPickerAuthors.value = action.authors
      authorPickerOpen.value = true
    }
  },
  'shift_l': () => {
    navigator.clipboard.writeText(`[[${slug.value}]]`)
  },
  'shift_c': () => {
    if (page.value?.url) {
      navigator.clipboard.writeText(page.value.url)
    }
  },
})
</script>

<template>
  <div v-if="page" class="lg:grid lg:grid-cols-12 lg:gap-8">
    <!-- Main content -->
    <article class="lg:col-span-8 xl:col-span-9">
      <ContentHeader :content="headerContent" :podcast="typedPodcast ?? undefined" :newsletter="typedNewsletter ?? undefined" :hosts="podcastHosts ?? undefined" />

      <YouTubePlayer
        v-if="page.url && isYouTubeUrl(page.url)"
        :url="page.url"
      />

      <BookCover
        v-if="(page.type === 'book' || page.type === 'manga') && page.cover"
        :cover="page.cover"
        :title="page.title"
      />

      <GitHubRepoCard
        v-if="page.type === 'github' && page.url"
        :url="page.url"
        :stars="page.stars"
        :language="page.language"
      />

      <div v-if="page.summary" class="mb-8 p-5 bg-[var(--ui-bg-elevated)] rounded-xl border border-[var(--ui-border)]">
        <p class="text-[var(--ui-text-muted)] italic leading-relaxed">
          {{ page.summary }}
        </p>
      </div>

      <section v-if="page.notes" class="mb-8 p-5 border-l-4 border-[var(--ui-primary)] bg-[var(--ui-bg-elevated)]/50 rounded-r-lg">
        <h2 class="text-sm font-semibold mb-2 text-[var(--ui-primary)]">
          My Notes
        </h2>
        <p class="leading-relaxed">
          {{ page.notes }}
        </p>
      </section>

      <div class="prose prose-neutral dark:prose-invert prose-lg prose-headings:font-semibold prose-a:text-[var(--ui-primary)] prose-a:no-underline hover:prose-a:underline">
        <ContentRenderer :value="page" />
      </div>

      <ContentBacklinksSection :backlinks="backlinks" :mentions="mentions" />

      <NoteGraph
        :slug="slug"
        :graph-data="noteGraph"
        @navigate="navigateToNote"
      />
    </article>

    <!-- TOC Sidebar (hidden on mobile, in focus mode, or when toggled off) -->
    <aside v-if="tocLinks.length > 0 && !isFocusMode && isTocVisible" class="hidden lg:block lg:col-span-4 xl:col-span-3">
      <div class="sticky top-20">
        <UContentToc
          :links="tocLinks"
          highlight
          color="neutral"
          highlight-color="neutral"
          title="On this page"
        />
      </div>
    </aside>

    <!-- Author Picker Modal -->
    <AuthorPickerModal
      v-model:open="authorPickerOpen"
      :authors="authorPickerAuthors"
    />
  </div>
</template>
