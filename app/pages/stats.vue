<script setup lang="ts">
interface HubNode {
  id: string
  title: string
  type: string
  connections: number
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

useSeoMeta({
  title: 'Stats - Second Brain',
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Stats
    </h1>

    <div v-if="status === 'pending'" class="text-center py-12 text-[var(--ui-text-muted)]">
      Loading stats...
    </div>

    <div v-else-if="stats" class="space-y-8">
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
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Content by Type -->
        <div class="p-4 rounded-lg border border-[var(--ui-border)]">
          <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
            Content by Type
          </h2>
          <StatsBarChart
            v-if="typeChartData.length"
            :data="typeChartData"
            :horizontal="true"
            :height="Math.max(160, typeChartData.length * 32)"
          />
          <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
            No content yet
          </div>
        </div>

        <!-- Top Tags -->
        <div class="p-4 rounded-lg border border-[var(--ui-border)]">
          <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
            Top Tags
          </h2>
          <StatsBarChart
            v-if="tagChartData.length"
            :data="tagChartData"
            :horizontal="true"
            :height="Math.max(160, tagChartData.length * 32)"
          />
          <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
            No tags yet
          </div>
        </div>
      </div>

      <!-- Growth Over Time -->
      <div v-if="growthChartData.length > 1" class="p-4 rounded-lg border border-[var(--ui-border)]">
        <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
          Growth Over Time
        </h2>
        <StatsLineChart :data="growthChartData" :height="180" />
      </div>

      <!-- Bottom Row: Hubs & Quality -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Hub Notes -->
        <div class="p-4 rounded-lg border border-[var(--ui-border)]">
          <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
            Hub Notes
            <span class="text-xs font-normal">(most connected)</span>
          </h2>
          <div v-if="stats.connections.hubs.length" class="space-y-2">
            <NuxtLink
              v-for="(hub, i) in stats.connections.hubs"
              :key="hub.id"
              :to="`/${hub.id}`"
              class="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-[var(--ui-bg-muted)] transition-colors"
            >
              <span class="text-[var(--ui-text-muted)] text-sm w-4">{{ i + 1 }}.</span>
              <span class="flex-1 truncate">{{ hub.title }}</span>
              <span class="text-xs text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-2 py-0.5 rounded">
                {{ hub.connections }}
              </span>
            </NuxtLink>
          </div>
          <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
            No connected notes yet
          </div>
        </div>

        <!-- Quality Metrics -->
        <div class="p-4 rounded-lg border border-[var(--ui-border)]">
          <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
            Quality Metrics
          </h2>
          <div v-if="qualityMetrics.length" class="space-y-4">
            <div v-for="metric in qualityMetrics" :key="metric.label">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ metric.label }}</span>
                <span class="text-[var(--ui-text-muted)]">{{ metric.value }} / {{ stats.quality.total }} ({{ metric.percent }}%)</span>
              </div>
              <UProgress :model-value="metric.percent" :color="metric.percent >= 70 ? 'success' : metric.percent >= 40 ? 'warning' : 'error'" />
            </div>
            <!-- Orphan progress (inverted - lower is better) -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Orphan-free</span>
                <span class="text-[var(--ui-text-muted)]">{{ 100 - stats.connections.orphanPercent }}%</span>
              </div>
              <UProgress
                :model-value="100 - stats.connections.orphanPercent"
                :color="stats.connections.orphanPercent <= 15 ? 'success' : stats.connections.orphanPercent <= 30 ? 'warning' : 'error'"
              />
            </div>
          </div>
          <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
            No content yet
          </div>
        </div>
      </div>

      <!-- Top Authors -->
      <div v-if="stats.byAuthor.length" class="p-4 rounded-lg border border-[var(--ui-border)]">
        <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
          Top Authors
        </h2>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            v-for="{ author, count } in stats.byAuthor.slice(0, 10)"
            :key="author"
            :to="`/authors/${author.toLowerCase().replace(/\s+/g, '-')}`"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors text-sm"
          >
            <span>{{ author }}</span>
            <span class="text-xs text-[var(--ui-text-muted)]">{{ count }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
