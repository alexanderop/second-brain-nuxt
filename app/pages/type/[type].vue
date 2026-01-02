<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useAsyncData, createError, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import ContentList from '~/components/ContentList.vue'
import { useListNavigation } from '~/composables/useListNavigation'
import type { ContentType } from '~~/content.config'

const route = useRoute()
const typeParam = computed(() => String(route.params.type))

const validTypes: readonly ContentType[] = [
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
  'evergreen',
  'map',
  'reddit',
]

function asContentType(value: string): ContentType | undefined {
  const found = validTypes.find(t => t === value)
  return found
}

const validatedType = asContentType(typeParam.value)
if (!validatedType) {
  throw createError({ status: 404, statusText: 'Invalid content type' })
}

const type = computed<ContentType>(() => asContentType(typeParam.value) ?? validatedType)

const { data: items } = await useAsyncData(`type-${type.value}`, () => {
  return queryCollection('content')
    .where('type', '=', type.value)
    .order('date', 'DESC')
    .all()
})

const { selectedIndex } = useListNavigation(items)

usePageTitle(() => `${type.value.charAt(0).toUpperCase() + type.value.slice(1)}s`)
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <BaseTypeIcon :type="type" size="lg" />
      <h1 class="text-2xl font-semibold capitalize">
        {{ type }}s
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ items?.length ?? 0 }})
      </span>
    </div>
    <ContentList :items="items ?? []" :selected-index="selectedIndex" />
  </div>
</template>
