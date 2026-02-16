<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useSeoMeta, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { ContentRenderer, UAvatar, UButton } from '#components'
import { buildSocialLinks } from '~/utils/socialLinks'

const { data: page } = await useAsyncData('about-page', () => {
  return queryCollection('pages')
    .path('/pages/about')
    .first()
})

const socialLinks = computed(() => buildSocialLinks(page.value?.socials))

usePageTitle(() => page.value?.title ?? 'About')

useSeoMeta({
  description: () => page.value?.description ?? '',
})
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-8">
      <UAvatar
        v-if="page?.avatar"
        :src="page.avatar"
        :alt="page?.title"
        size="xl"
      />
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ page?.title ?? 'About' }}
        </h1>
        <p v-if="page?.description" class="text-[var(--ui-text-muted)]">
          {{ page.description }}
        </p>
      </div>
    </div>

    <div v-if="page?.website || socialLinks.length" class="flex flex-wrap items-center gap-2 mb-8">
      <UButton
        v-if="page?.website"
        :to="page.website"
        target="_blank"
        variant="ghost"
        size="sm"
        icon="i-lucide-globe"
      >
        Website
      </UButton>
      <UButton
        v-for="link in socialLinks"
        :key="link.label"
        :to="link.url"
        target="_blank"
        variant="ghost"
        size="sm"
        :icon="link.icon"
      >
        {{ link.label }}
      </UButton>
    </div>

    <div
      v-if="page"
      class="prose prose-neutral dark:prose-invert prose-lg prose-headings:font-semibold prose-a:text-[var(--ui-primary)] prose-a:no-underline hover:prose-a:underline"
    >
      <ContentRenderer :value="page" />
    </div>
  </div>
</template>
