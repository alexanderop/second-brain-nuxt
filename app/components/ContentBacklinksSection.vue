<script setup lang="ts">
import { NuxtLink } from '#components'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import type { ContentType } from '~/constants/contentTypes'

interface Backlink {
  slug: string
  title: string
  type: ContentType
}

interface Mention {
  slug: string
  title: string
  type: ContentType
  snippet: string
  highlightedSnippet: string
}

defineProps<{
  backlinks: Array<Backlink>
  mentions?: Array<Mention>
}>()
</script>

<template>
  <section v-if="backlinks.length > 0 || (mentions && mentions.length > 0)" class="mt-12 pt-8 border-t border-[var(--ui-border)]">
    <!-- Linked References -->
    <div v-if="backlinks.length > 0" class="mb-8">
      <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
        Linked References ({{ backlinks.length }})
      </h2>
      <ul class="space-y-2">
        <li v-for="link in backlinks" :key="link.slug">
          <NuxtLink
            :to="`/${link.slug}`"
            class="flex items-center gap-2 p-2 -mx-2 rounded hover:bg-[var(--ui-bg-muted)] transition-colors"
          >
            <BaseTypeIcon :type="link.type" size="sm" class="text-[var(--ui-text-muted)]" />
            <span>{{ link.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Unlinked Mentions -->
    <div v-if="mentions && mentions.length > 0">
      <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
        Mentions ({{ mentions.length }})
      </h2>
      <ul class="space-y-2">
        <li v-for="mention in mentions" :key="mention.slug">
          <NuxtLink
            :to="`/${mention.slug}`"
            class="block p-3 -mx-2 rounded hover:bg-[var(--ui-bg-muted)] transition-colors"
          >
            <div class="flex items-center gap-2 mb-1">
              <BaseTypeIcon :type="mention.type" size="sm" class="text-[var(--ui-text-muted)]" />
              <span class="font-medium">{{ mention.title }}</span>
            </div>
            <p
              class="text-sm text-[var(--ui-text-muted)] line-clamp-2 pl-6"
              v-html="mention.highlightedSnippet"
            />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
