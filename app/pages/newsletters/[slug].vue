<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useAsyncData, queryCollection, createError } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { UIcon } from '#components'
import NewsletterHeader from '~/components/NewsletterHeader.vue'
import ContentList from '~/components/ContentList.vue'
import type { NewsletterItem } from '~/types/content'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

function isNewsletterItem(n: unknown): n is NewsletterItem {
  return typeof n === 'object' && n !== null && 'slug' in n && 'name' in n && 'authors' in n
}

const { data: newsletter } = await useAsyncData(`newsletter-${slug.value}`, () => {
  return queryCollection('newsletters')
    .where('slug', '=', slug.value)
    .first()
})

if (!newsletter.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Newsletter not found',
  })
}

const typedNewsletter = computed(() => {
  if (isNewsletterItem(newsletter.value)) return newsletter.value
  return null
})

const { data: articles } = await useAsyncData(`newsletter-articles-${slug.value}`, () => {
  return queryCollection('content')
    .where('type', '=', 'newsletter')
    .where('newsletter', '=', slug.value)
    .order('date', 'DESC')
    .all()
})

async function fetchAuthor(authorSlug: string) {
  const author = await queryCollection('authors')
    .where('slug', '=', authorSlug)
    .first()
  return author
    ? { slug: authorSlug, name: author.name }
    : { slug: authorSlug, name: authorSlug }
}

const { data: authorData } = await useAsyncData(`newsletter-authors-${slug.value}`, async () => {
  const authors = typedNewsletter.value?.authors
  if (!authors?.length) return {}
  const authorList = await Promise.all(authors.map(fetchAuthor))
  const map: Record<string, string> = {}
  for (const author of authorList) {
    map[author.slug] = author.name
  }
  return map
})

interface ContentWithBody {
  stem?: string
  slug: string
  title: string
  type: 'youtube' | 'podcast' | 'article' | 'book' | 'manga' | 'movie' | 'tv' | 'tweet' | 'course' | 'reddit' | 'github' | 'newsletter' | 'quote' | 'note' | 'evergreen' | 'map'
  date?: string
  authors?: string[]
  tags?: string[]
  summary?: string
  rating?: number
  body?: { value?: unknown[] }
}

function hasStringSlug(obj: object): obj is { slug: string } {
  return 'slug' in obj && typeof obj.slug === 'string'
}

function isContentWithBody(item: unknown): item is ContentWithBody {
  if (typeof item !== 'object' || item === null) return false
  return hasStringSlug(item)
}

function checkLinksInBody(item: ContentWithBody, slugsToCheck: string[]): boolean {
  if (!item.body?.value) return false
  const bodyStr = JSON.stringify(item.body.value)
  return slugsToCheck.some(s => bodyStr.includes(`[[${s}]]`))
}

function getArticleSlugs(arts: typeof articles.value): string[] {
  if (!arts) return []
  return arts.map(a => String(a.slug))
}

const { data: relatedContent } = await useAsyncData(`newsletter-related-${slug.value}`, async () => {
  const articleSlugs = getArticleSlugs(articles.value)
  if (articleSlugs.length === 0) return []

  const allContent = await queryCollection('content').all()

  const slugsToCheck: string[] = [...articleSlugs, slug.value]
  const related: ContentWithBody[] = []

  for (const item of allContent) {
    if (!isContentWithBody(item)) continue
    if (articleSlugs.includes(item.slug)) continue
    if (checkLinksInBody(item, slugsToCheck)) {
      related.push(item)
    }
  }

  return related
})

usePageTitle(() => typedNewsletter.value?.name ?? 'Newsletter')
</script>

<template>
  <div v-if="typedNewsletter">
    <NewsletterHeader
      :newsletter="typedNewsletter"
      :author-names="authorData ?? {}"
    />

    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-list" class="size-5 text-[var(--ui-text-muted)]" />
        <h2 class="text-xl font-semibold">
          Articles
        </h2>
        <span class="text-[var(--ui-text-muted)]">({{ articles?.length ?? 0 }})</span>
      </div>
      <ContentList v-if="articles?.length" :items="articles" />
      <p v-else class="text-[var(--ui-text-muted)]">
        No articles yet.
      </p>
    </section>

    <section v-if="relatedContent?.length">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-link" class="size-5 text-[var(--ui-text-muted)]" />
        <h2 class="text-xl font-semibold">
          Related
        </h2>
        <span class="text-[var(--ui-text-muted)]">({{ relatedContent.length }})</span>
      </div>
      <ContentList :items="relatedContent" />
    </section>
  </div>
</template>
