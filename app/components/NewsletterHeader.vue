<script setup lang="ts">
import { NuxtLink, UButton, UIcon } from '#components'
import type { NewsletterItem } from '~/types/content'

defineProps<{
  newsletter: NewsletterItem
  authorNames?: Record<string, string>
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
  <header class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <NuxtLink to="/newsletters" class="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]">
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <UIcon name="i-lucide-newspaper" class="size-6" />
      <span class="text-[var(--ui-text-muted)]">Newsletter</span>
    </div>

    <div class="flex flex-col sm:flex-row gap-6">
      <div class="shrink-0 size-32 rounded-xl overflow-hidden bg-[var(--ui-bg-muted)]">
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
          <UIcon name="i-lucide-newspaper" class="size-16" />
        </div>
        <div
          v-else
          class="size-full items-center justify-center text-[var(--ui-text-muted)] hidden"
        >
          <UIcon name="i-lucide-newspaper" class="size-16" />
        </div>
      </div>

      <div class="flex-1">
        <h1 class="text-3xl font-bold mb-2">
          {{ newsletter.name }}
        </h1>

        <p v-if="newsletter.description" class="text-[var(--ui-text-muted)] mb-4">
          {{ newsletter.description }}
        </p>

        <div v-if="newsletter.authors.length" class="mb-4 text-[var(--ui-text-muted)]">
          <span>by </span>
          <template v-for="(authorSlug, index) in newsletter.authors" :key="authorSlug">
            <NuxtLink
              :to="`/authors/${encodeURIComponent(authorSlug)}`"
              class="underline text-[var(--ui-text)]"
            >
              {{ authorNames?.[authorSlug] || authorSlug }}
            </NuxtLink>
            <span v-if="index < newsletter.authors.length - 1">, </span>
          </template>
        </div>

        <div v-if="newsletter.website" class="flex flex-wrap items-center gap-2">
          <UButton
            :to="newsletter.website"
            target="_blank"
            variant="ghost"
            size="sm"
            icon="i-lucide-globe"
          >
            Website
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
