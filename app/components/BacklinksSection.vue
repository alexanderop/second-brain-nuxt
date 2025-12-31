<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface Backlink {
  slug: string
  title: string
  type: string
}

defineProps<{
  backlinks: Array<Backlink>
}>()
</script>

<template>
  <section v-if="backlinks.length > 0" class="mt-12 pt-8 border-t border-[var(--ui-border)]">
    <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
      Linked References ({{ backlinks.length }})
    </h2>
    <ul class="space-y-2">
      <li v-for="link in backlinks" :key="link.slug">
        <NuxtLink
          :to="`/${link.slug}`"
          class="flex items-center gap-2 p-2 -mx-2 rounded hover:bg-[var(--ui-bg-muted)] transition-colors"
        >
          <TypeIcon :type="link.type as ContentType" size="sm" class="text-[var(--ui-text-muted)]" />
          <span>{{ link.title }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
