<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { useRequestURL } from '#imports'
import { NuxtLink, UButton, UDropdownMenu, UIcon } from '#components'
import BaseTagPill from '~/components/BaseTagPill.vue'
import type { TweetItem } from '~/types/content'

const props = defineProps<{
  tweet: TweetItem
  author: {
    name: string
    slug: string
    avatar?: string
    twitterHandle?: string
  }
}>()

const { copy, copied } = useClipboard()
const requestUrl = useRequestURL()

const copyItems: DropdownMenuItem[] = [
  {
    label: 'Copy Wiki',
    icon: 'i-lucide-link',
    onSelect: () => copy(`[[${props.tweet.slug}]]`),
  },
  {
    label: 'Copy URL',
    icon: 'i-lucide-globe',
    onSelect: () => copy(`${requestUrl.origin}/tweets/${props.tweet.slug}`),
  },
]

function formatDate(date?: Date | string) {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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
    <!-- Back link and type indicator -->
    <div class="flex items-center gap-3 mb-4">
      <NuxtLink
        :to="`/authors/${encodeURIComponent(author.slug)}`"
        class="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <UIcon name="i-simple-icons-x" class="size-5" />
      <span class="text-[var(--ui-text-muted)]">Tweet</span>
    </div>

    <!-- Tweet content card -->
    <div class="p-6 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-muted)]/50">
      <!-- Author header -->
      <div class="flex items-start gap-4">
        <NuxtLink
          :to="`/authors/${encodeURIComponent(author.slug)}`"
          class="shrink-0 size-14 rounded-full overflow-hidden bg-[var(--ui-bg-muted)] hover:opacity-80 transition-opacity"
        >
          <img
            v-if="author.avatar"
            :src="author.avatar"
            :alt="author.name"
            class="size-full object-cover"
            @error="handleImageError"
          >
          <div
            v-if="!author.avatar"
            class="size-full flex items-center justify-center text-[var(--ui-text-muted)]"
          >
            <UIcon name="i-lucide-user" class="size-7" />
          </div>
          <div
            v-else
            class="size-full items-center justify-center text-[var(--ui-text-muted)] hidden"
          >
            <UIcon name="i-lucide-user" class="size-7" />
          </div>
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <NuxtLink
            :to="`/authors/${encodeURIComponent(author.slug)}`"
            class="font-semibold text-lg hover:underline"
          >
            {{ author.name }}
          </NuxtLink>
          <p v-if="author.twitterHandle" class="text-[var(--ui-text-muted)]">
            @{{ author.twitterHandle }}
          </p>
        </div>
      </div>

      <!-- Tweet text -->
      <p class="mt-4 text-xl whitespace-pre-wrap leading-relaxed">
        {{ tweet.tweetText }}
      </p>

      <!-- Footer: date -->
      <p class="mt-4 text-[var(--ui-text-muted)]">
        {{ formatDate(tweet.tweetedAt) }}
      </p>
    </div>

    <!-- Tags and actions -->
    <div class="flex flex-wrap items-center gap-2 mt-4">
      <BaseTagPill v-for="tag in (tweet.tags ?? [])" :key="tag" :tag="tag" />
      <UDropdownMenu :items="copyItems" class="ml-2">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        />
      </UDropdownMenu>
      <UButton
        :to="tweet.tweetUrl"
        target="_blank"
        variant="outline"
        color="neutral"
        size="sm"
        icon="i-lucide-external-link"
      >
        View on X
      </UButton>
    </div>
  </header>
</template>
