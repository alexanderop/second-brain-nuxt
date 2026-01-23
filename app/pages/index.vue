<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import ContentCard from '~/components/ContentCard.vue'
import TweetCard from '~/components/TweetCard.vue'
import { useListNavigation } from '~/composables/useListNavigation'
import { getOrderedGroups } from '~/utils/timeGroups'
import type { ContentType } from '~/constants/contentTypes'

// Fetch content
const { data: contentItems } = await useAsyncData('recent-content', () => {
  return queryCollection('content')
    .order('date', 'DESC')
    .all()
})

// Fetch tweets
const { data: tweetItems } = await useAsyncData('recent-tweets', () => {
  return queryCollection('tweets')
    .order('tweetedAt', 'DESC')
    .all()
})

// Fetch authors for tweet display
const { data: authors } = await useAsyncData('homepage-authors', () =>
  queryCollection('authors').all(),
)

// Fetch podcasts for content display
const { data: podcasts } = await useAsyncData('homepage-podcasts', () =>
  queryCollection('podcasts').all(),
)

interface AuthorInfo {
  name: string
  slug: string
  avatar?: string
  twitterHandle?: string
}

// Create author lookup map
const authorMap = computed(() => {
  const map: Record<string, AuthorInfo> = {}
  for (const author of authors.value ?? []) {
    if (author && typeof author === 'object' && 'slug' in author && 'name' in author) {
      map[author.slug] = {
        name: author.name,
        slug: author.slug,
        avatar: author.avatar,
        twitterHandle: author.socials?.twitter,
      }
    }
  }
  return map
})

// Create podcast lookup map
const podcastMap = computed(() => {
  const map: Record<string, string> = {}
  for (const p of podcasts.value ?? []) {
    if (p && typeof p === 'object' && 'slug' in p && 'name' in p) {
      map[p.slug] = p.name
    }
  }
  return map
})

// Types for merged items that include navigation info
interface MergedContentItem {
  itemType: 'content'
  stem: string
  path: string
  date?: string
  title: string
  type: ContentType
  tags?: string[]
  authors?: string[]
  summary?: string
  rating?: number
  podcast?: string
  guests?: string[]
}

interface MergedTweetItem {
  itemType: 'tweet'
  stem: string
  path: string
  date: string
  slug: string
  type: 'tweet'
  title: string
  tweetId: string
  tweetUrl: string
  tweetText: string
  author: string
  tweetedAt: Date | string
  tags?: string[]
}

type MergedItem = MergedContentItem | MergedTweetItem

// Merge and normalize items
const allItems = computed<MergedItem[]>(() => {
  const content: MergedContentItem[] = (contentItems.value ?? []).map(item => ({
    itemType: 'content' as const,
    stem: item.stem,
    path: item.path,
    date: item.date,
    title: item.title,
    type: item.type,
    tags: item.tags,
    authors: item.authors,
    summary: item.summary,
    rating: item.rating,
    podcast: item.podcast,
    guests: item.guests,
  }))

  const tweets: MergedTweetItem[] = (tweetItems.value ?? []).map(tweet => ({
    itemType: 'tweet' as const,
    stem: tweet.stem,
    path: tweet.path,
    slug: tweet.stem,
    date: new Date(tweet.tweetedAt).toISOString(),
    type: 'tweet' as const,
    title: tweet.title,
    tweetId: tweet.tweetId,
    tweetUrl: tweet.tweetUrl,
    tweetText: tweet.tweetText,
    author: tweet.author,
    tweetedAt: tweet.tweetedAt,
    tags: tweet.tags,
  }))

  return [...content, ...tweets].sort((a, b) =>
    new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
  )
})

const { selectedIndex } = useListNavigation(allItems)

const orderedGroups = computed(() => getOrderedGroups(allItems.value))

function getGlobalIndex(groupIndex: number, itemIndex: number): number {
  let index = 0
  for (let i = 0; i < groupIndex; i++) {
    const group = orderedGroups.value[i]
    if (group) {
      index += group.items.length
    }
  }
  return index + itemIndex
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Recent Additions
    </h1>

    <template v-for="(group, groupIndex) in orderedGroups" :key="group.key">
      <section class="mb-8">
        <h2 class="text-lg font-medium text-[var(--ui-text-muted)] mb-4">
          {{ group.label }}
        </h2>
        <div>
          <template v-for="(item, itemIndex) in group.items" :key="item.stem">
            <TweetCard
              v-if="item.itemType === 'tweet'"
              :tweet="{ slug: item.slug, type: item.type, title: item.title, tweetId: item.tweetId, tweetUrl: item.tweetUrl, tweetText: item.tweetText, author: item.author, tweetedAt: item.tweetedAt, tags: item.tags }"
              :author="authorMap[item.author] ?? { name: item.author, slug: item.author }"
              class="mb-4 last:mb-0"
            />
            <ContentCard
              v-else
              :content="{ slug: item.stem, title: item.title, type: item.type, tags: item.tags, authors: item.authors, date: item.date, summary: item.summary, rating: item.rating, podcast: item.podcast, guests: item.guests }"
              :selected="getGlobalIndex(groupIndex, itemIndex) === selectedIndex"
              :podcast-name="item.podcast ? podcastMap[item.podcast] : undefined"
            />
          </template>
        </div>
      </section>
    </template>

    <div v-if="allItems.length === 0" class="py-8 text-center text-[var(--ui-text-muted)]">
      No content found.
    </div>
  </div>
</template>
