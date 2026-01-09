<script setup lang="ts">
import { NuxtLink, UIcon } from '#components'
import type { NewsletterItem } from '~/types/content'

defineProps<{
  newsletter: NewsletterItem
  articleCount?: number
}>()

function handleImageError(event: Event) {
  if (!(event.target instanceof HTMLImageElement)) return
  event.target.style.display = 'none'
  const fallback = event.target.nextElementSibling
  if (fallback instanceof HTMLElement) {
    fallback.style.display = 'flex'
  }
}
</script>

<template>
  <NuxtLink
    :to="`/newsletters/${newsletter.slug}`"
    class="group flex items-center gap-4 p-3 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors"
  >
    <div class="shrink-0 size-16 rounded-lg overflow-hidden bg-[var(--ui-bg-muted)]">
      <img
        v-if="newsletter.logo"
        :src="newsletter.logo"
        :alt="newsletter.name"
        class="size-full object-cover"
        @error="handleImageError"
      >
      <div
        v-if="!newsletter.logo"
        class="size-full flex items-center justify-center text-[var(--ui-text-muted)]"
      >
        <UIcon name="i-lucide-newspaper" class="size-8" />
      </div>
      <div
        v-else
        class="size-full items-center justify-center text-[var(--ui-text-muted)] hidden"
      >
        <UIcon name="i-lucide-newspaper" class="size-8" />
      </div>
    </div>
    <div class="min-w-0 flex-1">
      <h3 class="font-medium group-hover:underline">
        {{ newsletter.name }}
      </h3>
      <p v-if="articleCount" class="text-sm text-[var(--ui-text-muted)]">
        {{ articleCount }} {{ articleCount === 1 ? 'article' : 'articles' }}
      </p>
    </div>
  </NuxtLink>
</template>
