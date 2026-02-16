<script setup lang="ts">
import { NuxtLink, UIcon } from '#components'
import type { TweetItem } from '~/types/content'
import { formatDate } from '~/utils/formatDate'
import { handleImageError } from '~/utils/imageErrorHandler'

const props = defineProps<{
  tweet: TweetItem
  author: {
    name: string
    slug: string
    avatar?: string
    twitterHandle?: string
  }
}>()

function openExternalUrl() {
  window.open(props.tweet.tweetUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <article class="p-4 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors">
    <NuxtLink :to="`/tweets/${tweet.slug}`" class="block">
      <!-- Author header -->
      <div class="flex items-start gap-3">
        <div class="shrink-0 size-12 rounded-full overflow-hidden bg-[var(--ui-bg-muted)]">
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
            <UIcon name="i-lucide-user" class="size-6" />
          </div>
          <div
            v-else
            class="size-full items-center justify-center text-[var(--ui-text-muted)] hidden"
          >
            <UIcon name="i-lucide-user" class="size-6" />
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium">
            {{ author.name }}
          </p>
          <p v-if="author.twitterHandle" class="text-sm text-[var(--ui-text-muted)]">
            @{{ author.twitterHandle }}
          </p>
        </div>
      </div>

      <!-- Tweet text -->
      <p class="mt-3 whitespace-pre-wrap">
        {{ tweet.tweetText }}
      </p>

      <!-- Footer: date + external link -->
      <div class="mt-3 flex items-center justify-between text-sm text-[var(--ui-text-muted)]">
        <span>{{ formatDate(tweet.tweetedAt) }}</span>
        <button
          type="button"
          class="hover:text-[var(--ui-text)] flex items-center gap-1 cursor-pointer"
          aria-label="View original tweet"
          @click.stop="openExternalUrl"
        >
          <UIcon name="i-lucide-external-link" class="size-4" />
        </button>
      </div>
    </NuxtLink>
  </article>
</template>
