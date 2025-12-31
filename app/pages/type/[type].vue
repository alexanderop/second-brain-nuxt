<script setup lang="ts">
import type { ContentType } from '~~/content.config'

const route = useRoute()
const type = computed(() => route.params.type as ContentType)

const validTypes: Array<ContentType> = [
  'youtube',
  'podcast',
  'article',
  'book',
  'movie',
  'tv',
  'tweet',
  'quote',
  'course',
  'note',
]

if (!validTypes.includes(type.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Invalid content type', fatal: true })
}

const { data: items } = await useAsyncData(`type-${type.value}`, () => {
  return queryCollection('content')
    .where('type', '=', type.value)
    .order('date', 'DESC')
    .all()
})

useSeoMeta({
  title: () => `${type.value.charAt(0).toUpperCase() + type.value.slice(1)}s - Second Brain`,
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <TypeIcon :type="type" size="lg" />
      <h1 class="text-2xl font-semibold capitalize">
        {{ type }}s
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ items?.length ?? 0 }})
      </span>
    </div>
    <ContentList :items="items ?? []" />
  </div>
</template>
