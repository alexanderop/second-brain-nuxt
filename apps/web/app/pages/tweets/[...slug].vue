<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, useAsyncData, useSeoMeta, createError, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { ContentRenderer } from '#components'
import TweetHeader from '~/components/TweetHeader.vue'
import ContentBacklinksSection from '~/components/ContentBacklinksSection.vue'
import NoteGraph from '~/components/NoteGraph.vue'
import { useBacklinks } from '~/composables/useBacklinks'
import { useMentions } from '~/composables/useMentions'
import type { TweetItem } from '~/types/content'

function isTweetItem(t: unknown): t is TweetItem {
  return typeof t === 'object' && t !== null && 'tweetId' in t && 'tweetText' in t && 'author' in t
}

const route = useRoute()
const router = useRouter()

// Get slug from path (remove /tweets/ prefix)
const tweetSlug = computed(() => {
  const path = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
  return path
})

const { data: tweet } = await useAsyncData(`tweet-${tweetSlug.value}`, () => {
  return queryCollection('tweets').path(`/tweets/${tweetSlug.value}`).first()
})

if (!tweet.value) {
  throw createError({ status: 404, statusText: 'Tweet not found' })
}

const typedTweet = computed(() => {
  if (isTweetItem(tweet.value)) return tweet.value
  return null
})

// Fetch author data
const authorSlug = computed(() => typedTweet.value?.author ?? '')

const { data: authorData } = await useAsyncData(`tweet-author-${authorSlug.value}`, async () => {
  if (!authorSlug.value) return null
  return queryCollection('authors')
    .where('slug', '=', authorSlug.value)
    .first()
})

const authorInfo = computed(() => {
  if (!authorData.value) {
    return {
      name: authorSlug.value,
      slug: authorSlug.value,
      avatar: undefined,
      twitterHandle: undefined,
    }
  }
  // Extract twitter handle from socials.twitter URL if available
  let twitterHandle: string | undefined
  if (authorData.value.socials?.twitter) {
    const twitterUrl = authorData.value.socials.twitter
    twitterHandle = twitterUrl.includes('/') ? twitterUrl.split('/').pop() : twitterUrl
  }
  return {
    name: authorData.value.name,
    slug: authorData.value.slug,
    avatar: authorData.value.avatar,
    twitterHandle,
  }
})

// Backlinks and mentions
const fullSlug = computed(() => `tweets/${tweetSlug.value}`)
const { backlinks } = useBacklinks(fullSlug.value)
const { mentions } = useMentions(fullSlug.value, typedTweet.value?.title ?? '')

// Fetch note graph data for mini-graph visualization
const { data: noteGraph } = await useAsyncData(
  `note-graph-${fullSlug.value}`,
  () => $fetch(`/api/note-graph/${fullSlug.value}`),
)

function navigateToNote(targetSlug: string) {
  router.push(`/${targetSlug}`)
}

usePageTitle(() => typedTweet.value?.title ?? 'Tweet')

useSeoMeta({
  description: () => typedTweet.value?.tweetText ?? '',
})
</script>

<template>
  <div v-if="typedTweet">
    <article>
      <TweetHeader :tweet="typedTweet" :author="authorInfo" />

      <!-- Body content (annotations) -->
      <div
        v-if="tweet?.body"
        class="prose prose-neutral dark:prose-invert prose-lg prose-headings:font-semibold prose-a:text-[var(--ui-primary)] prose-a:no-underline hover:prose-a:underline"
      >
        <ContentRenderer :value="tweet" />
      </div>

      <ContentBacklinksSection :backlinks="backlinks" :mentions="mentions" />

      <NoteGraph
        :slug="fullSlug"
        :graph-data="noteGraph"
        @navigate="navigateToNote"
      />
    </article>
  </div>
</template>
