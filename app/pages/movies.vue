<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import ContentList from '~/components/ContentList.vue'

const { data: movies } = await useAsyncData('all-movies', () => {
  return queryCollection('content')
    .where('type', '=', 'movie')
    .order('watchedOn', 'DESC')
    .all()
})

const currentlyWatching = computed(() =>
  (movies.value ?? []).filter(movie => movie.watchingStatus === 'watching'),
)

const wantToWatch = computed(() =>
  (movies.value ?? []).filter(movie => movie.watchingStatus === 'want-to-watch'),
)

const noStatus = computed(() =>
  (movies.value ?? []).filter(movie => !movie.watchingStatus && !movie.watchedOn),
)

const byYear = computed(() => {
  const watchedMovies = (movies.value ?? []).filter(movie => movie.watchedOn)
  const grouped: Record<string, typeof watchedMovies> = {}

  for (const movie of watchedMovies) {
    const year = movie.watchedOn?.substring(0, 4) ?? 'Unknown'
    grouped[year] = grouped[year] ?? []
    grouped[year].push(movie)
  }

  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map(year => ({ year, movies: grouped[year] }))
})

usePageTitle('Movies')
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <BaseTypeIcon type="movie" size="lg" />
      <h1 class="text-2xl font-semibold">
        Movies
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ movies?.length ?? 0 }})
      </span>
    </div>

    <!-- Currently Watching -->
    <section v-if="currentlyWatching.length" class="mb-8">
      <h2 class="text-lg font-medium mb-4 text-[var(--ui-text-muted)]">
        Currently Watching
      </h2>
      <ContentList :items="currentlyWatching" />
    </section>

    <!-- Want to Watch -->
    <section v-if="wantToWatch.length" class="mb-8">
      <h2 class="text-lg font-medium mb-4 text-[var(--ui-text-muted)]">
        Want to Watch
      </h2>
      <ContentList :items="wantToWatch" />
    </section>

    <!-- Movies by Year -->
    <section v-for="{ year, movies: yearMovies } in byYear" :key="year" class="mb-8">
      <h2 class="text-lg font-medium mb-4">
        {{ year }}
      </h2>
      <ContentList :items="yearMovies ?? []" />
    </section>

    <!-- No Status (legacy movies without tracking) -->
    <section v-if="noStatus.length" class="mb-8">
      <h2 class="text-lg font-medium mb-4 text-[var(--ui-text-muted)]">
        Untracked
      </h2>
      <ContentList :items="noStatus" />
    </section>

    <!-- Empty state -->
    <div v-if="!movies?.length" class="text-center py-8 text-[var(--ui-text-muted)]">
      No movies found.
    </div>
  </div>
</template>
