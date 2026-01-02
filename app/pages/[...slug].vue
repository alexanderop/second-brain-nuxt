<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, useAsyncData, useSeoMeta, createError, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { ContentRenderer } from '#components'
import ContentHeader from '~/components/ContentHeader.vue'
import ContentBacklinksSection from '~/components/ContentBacklinksSection.vue'
import YouTubePlayer from '~/components/YouTubePlayer.vue'
import BookCover from '~/components/BookCover.vue'
import NoteGraph from '~/components/NoteGraph.vue'
import { useBacklinks } from '~/composables/useBacklinks'
import { useMentions } from '~/composables/useMentions'

const route = useRoute()
const router = useRouter()

const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ status: 404, statusText: 'Page not found' })
}

// Get slug from path (remove leading slash)
const slug = computed(() => route.path.replace(/^\//, ''))
const { backlinks } = useBacklinks(slug.value)
const { mentions } = useMentions(slug.value, page.value?.title ?? '')

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
})
</script>

<template>
  <article v-if="page">
    <ContentHeader
      :content="{ slug, title: page.title, type: page.type, url: page.url, tags: page.tags, authors: page.authors, date: page.date }"
    />

    <YouTubePlayer
      v-if="page.type === 'youtube' && page.url"
      :url="page.url"
    />

    <BookCover
      v-if="(page.type === 'book' || page.type === 'manga') && page.cover"
      :cover="page.cover"
      :title="page.title"
    />

    <div v-if="page.summary" class="mb-8 p-5 bg-[var(--ui-bg-elevated)] rounded-xl border border-[var(--ui-border)]">
      <p class="text-[var(--ui-text-muted)] italic leading-relaxed">
        {{ page.summary }}
      </p>
    </div>

    <div v-if="page.notes" class="mb-8 p-5 border-l-4 border-[var(--ui-primary)] bg-[var(--ui-bg-elevated)]/50 rounded-r-lg">
      <p class="text-sm font-semibold mb-2 text-[var(--ui-primary)]">
        My Notes
      </p>
      <p class="leading-relaxed">
        {{ page.notes }}
      </p>
    </div>

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
</template>
