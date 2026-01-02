<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, useAsyncData, useSeoMeta, createError, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { ContentRenderer } from '#components'
import ContentToc from '~/components/ContentToc.vue'
import ContentHeader from '~/components/ContentHeader.vue'
import ContentBacklinksSection from '~/components/ContentBacklinksSection.vue'
import YouTubePlayer from '~/components/YouTubePlayer.vue'
import BookCover from '~/components/BookCover.vue'
import GitHubRepoCard from '~/components/GitHubRepoCard.vue'
import NoteGraph from '~/components/NoteGraph.vue'
import { useBacklinks } from '~/composables/useBacklinks'
import { useMentions } from '~/composables/useMentions'

const route = useRoute()
const router = useRouter()

const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})

const tocLinks = computed(() => page.value?.body?.toc?.links ?? [])

if (!page.value) {
  throw createError({ status: 404, statusText: 'Page not found' })
}

// Get slug from path (remove leading slash)
const slug = computed(() => route.path.replace(/^\//, ''))
const { backlinks } = useBacklinks(slug.value)
const { mentions } = useMentions(slug.value, page.value?.title ?? '')

// Content header data (extracted to avoid inline object creation on each render)
// Non-null assertions are safe here since this is only used inside v-if="page"
const headerContent = computed(() => ({
  slug: slug.value,
  title: page.value!.title,
  type: page.value!.type,
  url: page.value?.url,
  tags: page.value?.tags,
  authors: page.value?.authors,
  date: page.value?.date,
}))

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
  <div v-if="page" class="lg:grid lg:grid-cols-12 lg:gap-8">
    <!-- Main content -->
    <article class="lg:col-span-8 xl:col-span-9">
      <ContentHeader :content="headerContent" />

      <YouTubePlayer
        v-if="page.type === 'youtube' && page.url"
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

    <!-- TOC Sidebar (hidden on mobile) -->
    <aside v-if="tocLinks.length > 0" class="hidden lg:block lg:col-span-4 xl:col-span-3">
      <div class="sticky top-20">
        <ContentToc
          :links="tocLinks"
          title="On this page"
        />
      </div>
    </aside>
  </div>
</template>
