<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useFetch } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { NuxtLink, UIcon, UProgress } from '#components'
import StatCard from '~/components/StatCard.vue'

// Lazy-load chart components to reduce initial bundle size
const StatsBarChart = defineAsyncComponent(() => import('~/components/StatsBarChart.vue'))
const StatsLineChart = defineAsyncComponent(() => import('~/components/StatsLineChart.vue'))

interface HubNode {
  id: string
  title: string
  type: string
  connections: number
}

interface OrphanNode {
  id: string
  title: string
  type: string
}

interface StatsData {
  total: number
  byType: Array<{ type: string, count: number }>
  byTag: Array<{ tag: string, count: number }>
  byAuthor: Array<{ author: string, count: number }>
  byMonth: Array<{ month: string, count: number }>
  quality: {
    withSummary: number
    withNotes: number
    total: number
  }
  connections: {
    totalEdges: number
    avgPerNote: number
    orphanCount: number
    orphanPercent: number
    hubs: HubNode[]
    orphans: OrphanNode[]
  }
  thisWeek: number
}

const { data: stats, status } = await useFetch<StatsData>('/api/stats')

const typeChartData = computed(() => {
  return (stats.value?.byType ?? []).map(item => ({
    label: item.type,
    value: item.count,
  }))
})

const tagChartData = computed(() => {
  return (stats.value?.byTag ?? []).slice(0, 8).map(item => ({
    label: item.tag,
    value: item.count,
  }))
})

const growthChartData = computed(() => {
  return (stats.value?.byMonth ?? []).map(item => ({
    label: item.month,
    value: item.count,
  }))
})

const qualityMetrics = computed(() => {
  const q = stats.value?.quality
  if (!q || q.total === 0) return []
  return [
    {
      label: 'Has summary',
      value: q.withSummary,
      percent: Math.round((q.withSummary / q.total) * 100),
    },
    {
      label: 'Has personal notes',
      value: q.withNotes,
      percent: Math.round((q.withNotes / q.total) * 100),
    },
  ]
})

usePageTitle('Stats')
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-8 tracking-tight">
      Stats
    </h1>

    <div v-if="status === 'pending'" class="text-center py-12 text-[var(--ui-text-muted)]">
      <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin mb-2" />
      <p>Loading stats...</p>
    </div>

    <div v-else-if="stats" class="space-y-10">
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Notes"
          :value="stats.total"
          icon="i-heroicons-document-text"
        />
        <StatCard
          label="Connections"
          :value="stats.connections.totalEdges"
          icon="i-heroicons-arrows-right-left"
        />
        <StatCard
          label="Orphan Notes"
          :value="`${stats.connections.orphanPercent}%`"
          icon="i-heroicons-document-minus"
        />
        <StatCard
          label="This Week"
          :value="stats.thisWeek"
          icon="i-heroicons-calendar"
        />
      </div>

      <!-- Charts Row -->
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Content by Type -->
        <div class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
            Content by Type
          </h2>
          <StatsBarChart
            v-if="typeChartData.length"
            :data="typeChartData"
            :horizontal="true"
            :height="Math.max(160, typeChartData.length * 32)"
          />
          <div v-else class="flex flex-col items-center justify-center py-10 text-[var(--ui-text-muted)]">
            <UIcon name="i-heroicons-document-plus" class="size-8 mb-2 opacity-50" />
            <p class="text-sm">No content yet</p>
          </div>
        </div>

        <!-- Top Tags -->
        <div class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
            Top Tags
          </h2>
          <StatsBarChart
            v-if="tagChartData.length"
            :data="tagChartData"
            :horizontal="true"
            :height="Math.max(160, tagChartData.length * 32)"
          />
          <div v-else class="flex flex-col items-center justify-center py-10 text-[var(--ui-text-muted)]">
            <UIcon name="i-heroicons-tag" class="size-8 mb-2 opacity-50" />
            <p class="text-sm">No tags yet</p>
          </div>
        </div>
      </div>

      <!-- Growth Over Time -->
      <div v-if="growthChartData.length > 1" class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
        <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
          Growth Over Time
        </h2>
        <StatsLineChart :data="growthChartData" :height="180" />
      </div>

      <!-- Bottom Row: Hubs, Orphans & Quality -->
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Hub Notes -->
        <div class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
            Hub Notes
            <span class="font-normal normal-case tracking-normal">(most connected)</span>
          </h2>
          <div v-if="stats.connections.hubs.length" class="space-y-1">
            <NuxtLink
              v-for="(hub, i) in stats.connections.hubs"
              :key="hub.id"
              :to="`/${hub.id}`"
              class="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-[var(--ui-bg-elevated)] transition-all duration-150"
            >
              <span class="text-[var(--ui-text-muted)] text-xs font-mono w-5">{{ i + 1 }}.</span>
              <span class="flex-1 truncate">{{ hub.title }}</span>
              <span class="text-xs font-mono text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-2 py-0.5 rounded-md">
                {{ hub.connections }}
              </span>
            </NuxtLink>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-10 text-[var(--ui-text-muted)]">
            <UIcon name="i-heroicons-link" class="size-8 mb-2 opacity-50" />
            <p class="text-sm mb-1">No connected notes yet</p>
            <p class="text-xs opacity-70">Add [[wiki-links]] to build your knowledge graph</p>
          </div>
        </div>

        <!-- Orphan Notes -->
        <div class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
            Orphan Notes
            <span class="font-normal normal-case tracking-normal">(no connections)</span>
          </h2>
          <div v-if="stats.connections.orphans.length" class="space-y-1">
            <NuxtLink
              v-for="orphan in stats.connections.orphans"
              :key="orphan.id"
              :to="`/${orphan.id}`"
              class="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-[var(--ui-bg-elevated)] transition-all duration-150"
            >
              <span class="flex-1 truncate">{{ orphan.title }}</span>
              <span class="text-xs font-mono text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-2 py-0.5 rounded-md">
                {{ orphan.type }}
              </span>
            </NuxtLink>
            <p v-if="stats.connections.orphanCount > 5" class="text-xs text-[var(--ui-text-muted)] pt-2">
              +{{ stats.connections.orphanCount - 5 }} more orphans
            </p>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-10 text-[var(--ui-text-muted)]">
            <UIcon name="i-heroicons-check-circle" class="size-8 mb-2 opacity-50" />
            <p class="text-sm">All notes are connected!</p>
          </div>
        </div>

        <!-- Quality Metrics -->
        <div class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
            Quality Metrics
          </h2>
          <div v-if="qualityMetrics.length" class="space-y-5">
            <div v-for="metric in qualityMetrics" :key="metric.label" class="quality-metric">
              <div class="flex justify-between text-sm mb-2">
                <span>{{ metric.label }}</span>
                <span class="text-[var(--ui-text-muted)] font-mono text-xs">{{ metric.value }} / {{ stats.quality.total }} ({{ metric.percent }}%)</span>
              </div>
              <div class="progress-animated">
                <UProgress :model-value="metric.percent" :color="metric.percent >= 70 ? 'success' : metric.percent >= 40 ? 'warning' : 'error'" />
              </div>
            </div>
            <!-- Orphan progress (inverted - lower is better) -->
            <div class="quality-metric">
              <div class="flex justify-between text-sm mb-2">
                <span>Orphan-free</span>
                <span class="text-[var(--ui-text-muted)] font-mono text-xs">{{ 100 - stats.connections.orphanPercent }}%</span>
              </div>
              <div class="progress-animated">
                <UProgress
                  :model-value="100 - stats.connections.orphanPercent"
                  :color="stats.connections.orphanPercent <= 15 ? 'success' : stats.connections.orphanPercent <= 30 ? 'warning' : 'error'"
                />
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-10 text-[var(--ui-text-muted)]">
            <UIcon name="i-heroicons-chart-bar" class="size-8 mb-2 opacity-50" />
            <p class="text-sm">No content yet</p>
          </div>
        </div>
      </div>

      <!-- Top Authors -->
      <div v-if="stats.byAuthor.length" class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
        <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] mb-4 uppercase tracking-wider">
          Top Authors
        </h2>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            v-for="{ author, count } in stats.byAuthor.slice(0, 10)"
            :key="author"
            :to="`/authors/${author.toLowerCase().replace(/\s+/g, '-')}`"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--ui-border)] hover:bg-[var(--ui-bg-elevated)] hover:border-[var(--ui-border-accented)] transition-all duration-150 text-sm"
          >
            <span>{{ author }}</span>
            <span class="text-xs font-mono text-[var(--ui-text-muted)]">{{ count }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  transition: border-color 200ms ease-out;
}

.stats-card:hover {
  border-color: var(--ui-border-accented);
}

/* Animate progress bars on mount */
.progress-animated :deep(.relative > div) {
  animation: progress-fill 600ms ease-out;
}

@keyframes progress-fill {
  from {
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
    transform-origin: left;
  }
}
</style>
