<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// Get slug from path (remove leading slash)
const slug = computed(() => route.path.replace(/^\//, ''))
const { backlinks } = useBacklinks(slug.value)
const { mentions } = useMentions(slug.value, page.value?.title ?? '')

useSeoMeta({
  title: () => page.value?.title ?? 'Second Brain',
  description: () => page.value?.summary ?? '',
})
</script>

<template>
  <article v-if="page">
    <ContentHeader
      :title="page.title"
      :type="page.type"
      :slug="slug"
      :url="page.url"
      :tags="page.tags"
      :authors="page.authors"
      :date="page.date"
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
  </article>
</template>
