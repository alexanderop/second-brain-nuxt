<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import ContentList from '~/components/ContentList.vue'

const { data: books } = await useAsyncData('all-books', () => {
  return queryCollection('content')
    .where('type', '=', 'book')
    .order('finishedReading', 'DESC')
    .all()
})

const currentlyReading = computed(() =>
  (books.value ?? []).filter(book => book.readingStatus === 'reading'),
)

const wantToRead = computed(() =>
  (books.value ?? []).filter(book => book.readingStatus === 'want-to-read'),
)

const noStatus = computed(() =>
  (books.value ?? []).filter(book => !book.readingStatus && !book.finishedReading),
)

const byYear = computed(() => {
  const finishedBooks = (books.value ?? []).filter(book => book.finishedReading)
  const grouped: Record<string, typeof finishedBooks> = {}

  for (const book of finishedBooks) {
    const year = book.finishedReading?.substring(0, 4) ?? 'Unknown'
    grouped[year] = grouped[year] ?? []
    grouped[year].push(book)
  }

  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map(year => ({ year, books: grouped[year] }))
})

usePageTitle('Books')
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <BaseTypeIcon type="book" size="lg" />
      <h1 class="text-2xl font-semibold">
        Books
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ books?.length ?? 0 }})
      </span>
    </div>

    <!-- Currently Reading -->
    <section v-if="currentlyReading.length" class="mb-8">
      <h2 class="text-lg font-medium mb-4 text-[var(--ui-text-muted)]">
        Currently Reading
      </h2>
      <ContentList :items="currentlyReading" />
    </section>

    <!-- Want to Read -->
    <section v-if="wantToRead.length" class="mb-8">
      <h2 class="text-lg font-medium mb-4 text-[var(--ui-text-muted)]">
        Want to Read
      </h2>
      <ContentList :items="wantToRead" />
    </section>

    <!-- Books by Year -->
    <section v-for="{ year, books: yearBooks } in byYear" :key="year" class="mb-8">
      <h2 class="text-lg font-medium mb-4">
        {{ year }}
      </h2>
      <ContentList :items="yearBooks ?? []" />
    </section>

    <!-- No Status (legacy books without tracking) -->
    <section v-if="noStatus.length" class="mb-8">
      <h2 class="text-lg font-medium mb-4 text-[var(--ui-text-muted)]">
        Untracked
      </h2>
      <ContentList :items="noStatus" />
    </section>

    <!-- Empty state -->
    <div v-if="!books?.length" class="text-center py-8 text-[var(--ui-text-muted)]">
      No books found.
    </div>
  </div>
</template>
