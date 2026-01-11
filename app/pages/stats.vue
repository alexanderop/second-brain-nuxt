<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useFetch } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { NuxtLink, UIcon, UInput, UModal, UPagination, UProgress } from '#components'
import StatCard from '~/components/StatCard.vue'

const orphanModalOpen = ref(false)
const orphanPage = ref(1)
const orphanPageSize = 10
const orphanFilter = ref('')
const orphanSort = ref<{ column: 'title' | 'type', direction: 'asc' | 'desc' }>({ column: 'title', direction: 'asc' })

function openOrphanModal() {
  orphanPage.value = 1
  orphanFilter.value = ''
  orphanSort.value = { column: 'title', direction: 'asc' }
  orphanModalOpen.value = true
}

function toggleOrphanSort(column: 'title' | 'type') {
  if (orphanSort.value.column === column) {
    orphanSort.value.direction = orphanSort.value.direction === 'asc' ? 'desc' : 'asc'
    orphanPage.value = 1
    return
  }
  orphanSort.value = { column, direction: 'asc' }
  orphanPage.value = 1
}

function getSortIndicator(column: 'title' | 'type') {
  if (orphanSort.value.column !== column) return '↕'
  return orphanSort.value.direction === 'asc' ? '↑' : '↓'
}

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
  byDay: Array<{ date: string, count: number }>
  startDate: string | null
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

// Growth chart filters
type TimeRange = '7d' | '30d' | '1y' | 'all'
type ChartMode = 'cumulative' | 'daily'

const timeRange = ref<TimeRange>('all')
const chartMode = ref<ChartMode>('cumulative')

const timeRangeOptions = [
  { value: '7d' as const, label: '7D' },
  { value: '30d' as const, label: '30D' },
  { value: '1y' as const, label: '1Y' },
  { value: 'all' as const, label: 'All' },
]

const chartModeOptions = [
  { value: 'cumulative' as const, label: 'Cumulative' },
  { value: 'daily' as const, label: 'Daily' },
]

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

function getCutoffDate(range: TimeRange, startDate: string | null): Date {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000

  if (range === '7d') return new Date(now.getTime() - 7 * dayMs)
  if (range === '30d') return new Date(now.getTime() - 30 * dayMs)
  if (range === '1y') return new Date(now.getTime() - 365 * dayMs)
  return startDate ? new Date(startDate) : new Date(0)
}

function getDailyChartData(byDay: StatsData['byDay'], cutoffStr: string) {
  return byDay.filter(d => d.date >= cutoffStr).map(item => ({
    label: item.date,
    value: item.count,
  }))
}

function getCumulativeDailyData(byDay: StatsData['byDay'], cutoffStr: string) {
  const priorCount = byDay.filter(d => d.date < cutoffStr).reduce((sum, d) => sum + d.count, 0)
  let cumulative = priorCount

  return byDay.filter(d => d.date >= cutoffStr).map(item => {
    cumulative += item.count
    return { label: item.date, value: cumulative }
  })
}

function getCumulativeMonthlyData(byMonth: StatsData['byMonth'], cutoffStr: string) {
  const cutoffMonth = cutoffStr.substring(0, 7)
  return byMonth.filter(m => m.month >= cutoffMonth).map(item => ({
    label: item.month,
    value: item.count,
  }))
}

const growthChartData = computed(() => {
  if (!stats.value) return []

  const cutoffDate = getCutoffDate(timeRange.value, stats.value.startDate)
  const cutoffStr = cutoffDate.toISOString().substring(0, 10)
  const byDay = stats.value.byDay ?? []
  const byMonth = stats.value.byMonth ?? []

  if (chartMode.value === 'daily') {
    return getDailyChartData(byDay, cutoffStr)
  }

  const useDaily = timeRange.value === '7d' || timeRange.value === '30d'
  if (useDaily) {
    return getCumulativeDailyData(byDay, cutoffStr)
  }

  return getCumulativeMonthlyData(byMonth, cutoffStr)
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

const filteredOrphans = computed(() => {
  let orphans = stats.value?.connections.orphans ?? []

  // Filter
  if (orphanFilter.value) {
    const query = orphanFilter.value.toLowerCase()
    orphans = orphans.filter(o =>
      o.title.toLowerCase().includes(query) || o.type.toLowerCase().includes(query),
    )
  }

  // Sort
  const { column, direction } = orphanSort.value
  orphans = [...orphans].sort((a, b) => {
    const aVal = a[column].toLowerCase()
    const bVal = b[column].toLowerCase()
    const cmp = aVal.localeCompare(bVal)
    return direction === 'asc' ? cmp : -cmp
  })

  return orphans
})

const paginatedOrphans = computed(() => {
  const start = (orphanPage.value - 1) * orphanPageSize
  return filteredOrphans.value.slice(start, start + orphanPageSize)
})

const orphanTotal = computed(() => filteredOrphans.value.length)

// Reset page when filter changes
watch(orphanFilter, () => {
  orphanPage.value = 1
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
      <div v-if="stats?.byDay?.length" class="stats-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider">
            Growth Over Time
          </h2>
          <div class="flex items-center gap-3">
            <!-- Chart Mode Toggle -->
            <div class="flex rounded-lg border border-[var(--ui-border)] overflow-hidden">
              <button
                v-for="option in chartModeOptions"
                :key="option.value"
                class="px-3 py-1 text-xs font-medium transition-colors"
                :class="chartMode === option.value
                  ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text)]'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-muted)]'"
                @click="chartMode = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <!-- Time Range Tabs -->
            <div class="flex rounded-lg border border-[var(--ui-border)] overflow-hidden">
              <button
                v-for="option in timeRangeOptions"
                :key="option.value"
                class="px-3 py-1 text-xs font-medium transition-colors"
                :class="timeRange === option.value
                  ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text)]'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-muted)]'"
                @click="timeRange = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
        <StatsLineChart v-if="growthChartData.length > 1" :data="growthChartData" :height="180" />
        <div v-else class="flex flex-col items-center justify-center py-10 text-[var(--ui-text-muted)]">
          <UIcon name="i-heroicons-chart-bar" class="size-8 mb-2 opacity-50" />
          <p class="text-sm">No data for selected period</p>
        </div>
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
              v-for="orphan in stats.connections.orphans.slice(0, 5)"
              :key="orphan.id"
              :to="`/${orphan.id}`"
              class="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-[var(--ui-bg-elevated)] transition-all duration-150"
            >
              <span class="flex-1 truncate">{{ orphan.title }}</span>
              <span class="text-xs font-mono text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-2 py-0.5 rounded-md">
                {{ orphan.type }}
              </span>
            </NuxtLink>
            <button
              v-if="stats.connections.orphanCount > 5"
              class="text-xs text-[var(--ui-text-muted)] pt-2 hover:text-[var(--ui-text)] hover:underline cursor-pointer"
              @click="openOrphanModal"
            >
              +{{ stats.connections.orphanCount - 5 }} more orphans
            </button>
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

    <!-- Orphan Notes Modal (outside stats div to reduce nesting) -->
    <UModal v-model:open="orphanModalOpen" :ui="{ content: 'w-full max-w-2xl' }">
      <template #content>
        <div class="p-6 flex flex-col max-h-[70vh]">
          <!-- Header (fixed) -->
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 class="text-lg font-semibold">
              Orphan Notes
              <span class="text-sm font-normal text-[var(--ui-text-muted)]">({{ stats?.connections.orphanCount }})</span>
            </h2>
            <button
              aria-label="Close modal"
              class="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] p-1"
              @click="orphanModalOpen = false"
            >
              <UIcon name="i-heroicons-x-mark" class="size-5" />
            </button>
          </div>

          <!-- Filter (fixed) -->
          <UInput
            v-model="orphanFilter"
            placeholder="Filter by title or type..."
            icon="i-heroicons-magnifying-glass"
            size="sm"
            class="mb-4 flex-shrink-0"
          />

          <!-- Table (fixed height via row count) -->
          <table class="w-full min-h-[360px]">
            <thead class="sticky top-0 bg-[var(--ui-bg)] z-10">
              <tr class="text-left text-xs text-[var(--ui-text-muted)] uppercase tracking-wider border-b border-[var(--ui-border)]">
                <th class="pb-2 cursor-pointer hover:text-[var(--ui-text)]" @click="toggleOrphanSort('title')">
                  Title {{ getSortIndicator('title') }}
                </th>
                <th class="pb-2 text-right cursor-pointer hover:text-[var(--ui-text)]" @click="toggleOrphanSort('type')">
                  Type {{ getSortIndicator('type') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="orphan in paginatedOrphans"
                :key="orphan.id"
                class="border-b border-[var(--ui-border)] last:border-0 h-10"
              >
                <td class="py-2.5">
                  <NuxtLink
                    :to="`/${orphan.id}`"
                    class="hover:text-[var(--ui-primary)] hover:underline"
                    @click="orphanModalOpen = false"
                  >
                    {{ orphan.title }}
                  </NuxtLink>
                </td>
                <td class="py-2.5 text-right">
                  <span class="text-xs font-mono text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-2 py-0.5 rounded-md">
                    {{ orphan.type }}
                  </span>
                </td>
              </tr>
              <tr v-if="paginatedOrphans.length === 0">
                <td colspan="2" class="py-8 text-center text-[var(--ui-text-muted)]">
                  No orphans match your filter
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination (fixed at bottom) -->
          <div v-if="orphanTotal > orphanPageSize" class="flex-shrink-0 mt-4 pt-4 border-t border-[var(--ui-border)] flex justify-center">
            <UPagination
              v-model:page="orphanPage"
              :total="orphanTotal"
              :items-per-page="orphanPageSize"
              :sibling-count="1"
              show-edges
              size="sm"
            />
          </div>
        </div>
      </template>
    </UModal>
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
