<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useSeoMeta, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { ContentRenderer, UAvatar, UButton } from '#components'

const { data: page } = await useAsyncData('about-page', () => {
  return queryCollection('pages')
    .path('/pages/about')
    .first()
})

const socialLinks = computed(() => {
  if (!page.value?.socials) return []
  const socials = page.value.socials
  const links = []
  if (socials.twitter) links.push({ icon: 'i-lucide-twitter', url: `https://twitter.com/${socials.twitter}`, label: 'Twitter' })
  if (socials.github) links.push({ icon: 'i-lucide-github', url: `https://github.com/${socials.github}`, label: 'GitHub' })
  if (socials.linkedin) links.push({ icon: 'i-lucide-linkedin', url: `https://linkedin.com/in/${socials.linkedin}`, label: 'LinkedIn' })
  if (socials.youtube) links.push({ icon: 'i-lucide-youtube', url: `https://youtube.com/@${socials.youtube}`, label: 'YouTube' })
  if (socials.bluesky) links.push({ icon: 'i-lucide-cloud', url: `https://bsky.app/profile/${socials.bluesky}`, label: 'Bluesky' })
  return links
})

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
