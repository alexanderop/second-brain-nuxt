<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { NuxtLink, UButton } from '#components'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import BaseTagPill from '~/components/BaseTagPill.vue'
import type { ContentItem } from '~/types/content'

const props = defineProps<{
  content: ContentItem
}>()

const { copy, copied } = useClipboard()

function copyWikiLink() {
  copy(`[[${props.content.slug}]]`)
}

function formatDate(date?: Date | string) {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <header class="mb-8">
    <div class="flex items-center gap-2 mb-2 text-[var(--ui-text-muted)]">
      <BaseTypeIcon :type="content.type" size="sm" />
      <span class="text-sm capitalize">{{ content.type }}</span>
      <span v-if="content.date" class="text-sm">{{ formatDate(content.date) }}</span>
    </div>
    <h1 class="text-3xl font-bold mb-4">
      {{ content.title }}
    </h1>
    <div v-if="content.authors?.length" class="mb-4 text-[var(--ui-text-muted)]">
      <span>by </span>
      <template v-for="(author, index) in content.authors" :key="author">
        <NuxtLink
          :to="`/authors/${encodeURIComponent(author)}`"
          class="hover:underline text-[var(--ui-text)]"
        >
          {{ author }}
        </NuxtLink>
        <span v-if="index < content.authors.length - 1">, </span>
      </template>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <BaseTagPill v-for="tag in (content.tags ?? [])" :key="tag" :tag="tag" />
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-link'"
        class="ml-2"
        @click="copyWikiLink"
      >
        {{ copied ? 'Copied!' : 'Copy link' }}
      </UButton>
      <UButton
        v-if="content.url"
        :to="content.url"
        target="_blank"
        variant="outline"
        color="neutral"
        size="sm"
        icon="i-lucide-external-link"
      >
        Open Link
      </UButton>
    </div>
  </header>
</template>
