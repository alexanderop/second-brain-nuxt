<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { UIcon } from '#components'
import NewsletterCard from '~/components/NewsletterCard.vue'
import { isNewsletterItem } from '~/types/content'
import type { NewsletterItem } from '~/types/content'

interface ArticleData {
  newsletter?: string
  date?: string
}

const { data: allNewsletters } = await useAsyncData('all-newsletters', () => {
  return queryCollection('newsletters').all()
})

const { data: allArticles } = await useAsyncData('all-newsletter-articles', () => {
  return queryCollection('content')
    .where('type', '=', 'newsletter')
    .select('newsletter', 'date')
    .all()
})

interface NewsletterStats {
  count: number
  mostRecent: string | null
}

const newsletterStats = computed(() => {
  const stats: Record<string, NewsletterStats> = {}
  for (const article of allArticles.value ?? []) {
    if (!isNewsletterArticle(article)) continue
    const newsletterSlug = article.newsletter
    if (!newsletterSlug) continue

    if (!stats[newsletterSlug]) {
      stats[newsletterSlug] = { count: 0, mostRecent: null }
    }
    stats[newsletterSlug].count++
    const date = article.date
    const existing = stats[newsletterSlug].mostRecent
    if (date && (!existing || date > existing)) {
      stats[newsletterSlug].mostRecent = date
    }
  }
  return stats
})

function isNewsletterArticle(article: unknown): article is ArticleData {
  return typeof article === 'object' && article !== null
}

const activeNewsletters = computed(() => {
  const newsletters = (allNewsletters.value ?? []).filter(isNewsletterItem)
  const stats = newsletterStats.value
  return newsletters
    .filter(n => (stats[n.slug]?.count ?? 0) > 0)
    .sort((a, b) => {
      const dateA = stats[a.slug]?.mostRecent ?? ''
      const dateB = stats[b.slug]?.mostRecent ?? ''
      return dateB.localeCompare(dateA)
    })
})

usePageTitle('Newsletters')
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UIcon name="i-lucide-newspaper" class="size-6" />
      <h1 class="text-2xl font-semibold">
        Newsletters
      </h1>
    </div>

    <div v-if="activeNewsletters.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NewsletterCard
        v-for="newsletter in activeNewsletters"
        :key="newsletter.slug"
        :newsletter="newsletter"
        :article-count="newsletterStats[newsletter.slug]?.count ?? 0"
      />
    </div>

    <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
      No newsletters with articles found.
    </div>
  </div>
</template>
