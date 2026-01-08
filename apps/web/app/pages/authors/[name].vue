<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useAsyncData, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { NuxtLink, UIcon, UButton, UAvatar } from '#components'
import ContentList from '~/components/ContentList.vue'
import TweetCard from '~/components/TweetCard.vue'
import type { TweetItem } from '~/types/content'

const route = useRoute()
const authorSlug = computed(() => decodeURIComponent(String(route.params.name)))

const { data: authorData } = await useAsyncData(`author-data-${authorSlug.value}`, () => {
  return queryCollection('authors')
    .where('slug', '=', authorSlug.value)
    .first()
})

const { data: items } = await useAsyncData(`author-${authorSlug.value}`, () => {
  return queryCollection('content')
    .where('authors', 'LIKE', `%${authorSlug.value}%`)
    .order('date', 'DESC')
    .all()
})

// Fetch tweets by this author
const { data: tweets } = await useAsyncData(`author-tweets-${authorSlug.value}`, () => {
  return queryCollection('tweets')
    .where('author', '=', authorSlug.value)
    .order('tweetedAt', 'DESC')
    .all()
})

const typedTweets = computed<TweetItem[]>(() => {
  if (!tweets.value) return []
  // Transform collection items to include slug derived from path
  return tweets.value
    .filter(t => t.tweetId && t.tweetText && t.author)
    .map((t): TweetItem => ({
      slug: t.path?.replace(/^\/tweets\//, '') ?? `tweet-${t.tweetId}`,
      type: 'tweet',
      title: t.title ?? '',
      tweetId: t.tweetId,
      tweetUrl: t.tweetUrl ?? '',
      tweetText: t.tweetText,
      author: t.author,
      tweetedAt: t.tweetedAt ?? new Date(),
      tags: t.tags,
    }))
})

// Author info for TweetCard
const authorInfo = computed(() => {
  if (!authorData.value) {
    return {
      name: authorSlug.value,
      slug: authorSlug.value,
      avatar: undefined,
      twitterHandle: undefined,
    }
  }
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

const authorName = computed(() => authorData.value?.name ?? authorSlug.value)

usePageTitle(() => authorName.value)

const socialLinks = computed(() => {
  if (!authorData.value?.socials) return []
  const socials = authorData.value.socials
  const links = []
  if (socials.twitter) links.push({ icon: 'i-lucide-twitter', url: `https://twitter.com/${socials.twitter}`, label: 'Twitter' })
  if (socials.github) links.push({ icon: 'i-lucide-github', url: `https://github.com/${socials.github}`, label: 'GitHub' })
  if (socials.linkedin) links.push({ icon: 'i-lucide-linkedin', url: `https://linkedin.com/in/${socials.linkedin}`, label: 'LinkedIn' })
  if (socials.youtube) links.push({ icon: 'i-lucide-youtube', url: `https://youtube.com/@${socials.youtube}`, label: 'YouTube' })
  return links
})
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <NuxtLink to="/authors" class="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]">
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
        <UAvatar
          v-if="authorData?.avatar"
          :src="authorData.avatar"
          :alt="authorName"
          size="lg"
        />
        <UIcon v-else name="i-lucide-user" class="size-6" />
        <h1 class="text-2xl font-semibold">
          {{ authorName }}
        </h1>
        <span class="text-[var(--ui-text-muted)]">
          ({{ (items?.length ?? 0) + typedTweets.length }})
        </span>
      </div>

      <div v-if="authorData?.bio" class="text-[var(--ui-text-muted)] mb-4">
        {{ authorData.bio }}
      </div>

      <div v-if="authorData?.website || socialLinks.length" class="flex items-center gap-3">
        <UButton
          v-if="authorData?.website"
          :to="authorData.website"
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
    </div>

    <!-- Notes section -->
    <section v-if="items?.length" class="mb-8">
      <h2 class="text-lg font-semibold mb-4">
        Notes ({{ items.length }})
      </h2>
      <ContentList :items="items" />
    </section>

    <!-- Tweets section -->
    <section v-if="typedTweets.length">
      <h2 class="text-lg font-semibold mb-4">
        Tweets ({{ typedTweets.length }})
      </h2>
      <div class="space-y-4">
        <TweetCard
          v-for="tweet in typedTweets"
          :key="tweet.tweetId"
          :tweet="tweet"
          :author="authorInfo"
        />
      </div>
    </section>
  </div>
</template>
