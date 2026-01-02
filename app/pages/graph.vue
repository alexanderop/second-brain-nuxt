<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery, onKeyStroke, useLocalStorage } from '@vueuse/core'
import { useAsyncData, definePageMeta } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { NuxtLink, ClientOnly, UIcon, UButton, UTooltip, UDrawer, UModal } from '#components'
import KnowledgeGraph from '~/components/KnowledgeGraph.vue'
import GraphFilters from '~/components/GraphFilters.vue'
import GraphNodePanel from '~/components/GraphNodePanel.vue'
import { useGraphFilters } from '~/composables/useGraphFilters'
import type { ContentType } from '~~/content.config'
import type { FullGraphData, FullGraphNode, FullGraphEdge, UnifiedGraphNode } from '~/types/graph'

// Use immersive graph layout (no header)
definePageMeta({
  layout: 'graph',
})

// Helper to get ID from edge endpoint (handles both string and object)
function getEdgeNodeId(endpoint: string | FullGraphNode): string {
  return typeof endpoint === 'string' ? endpoint : endpoint.id
}

usePageTitle('Graph')

// Collapsible filter panel state (persisted in localStorage)
const filtersExpanded = useLocalStorage('graph-filters-expanded', false)

const { data: graphData } = await useAsyncData<FullGraphData>('graph-data', () => $fetch<FullGraphData>('/api/graph'))

const selectedNode = ref<FullGraphNode | null>(null)

// Template ref for KnowledgeGraph component (for zoom controls)
const graphRef = ref<{ fitAll: () => void, zoomIn: () => void, zoomOut: () => void }>()

// Zoom level for display
const zoomLevel = ref(1)

// Mobile detection
const isMobile = useMediaQuery('(max-width: 768px)')

// Filters
const { filterState } = useGraphFilters()

// Extract available types and tags from graph data
const availableTypes = computed<Array<ContentType>>(() => {
  if (!graphData.value)
    return []
  return [...new Set(graphData.value.nodes.map(n => n.type))]
})

const availableTags = computed<Array<string>>(() => {
  if (!graphData.value)
    return []
  return [...new Set(graphData.value.nodes.flatMap(n => n.tags))].sort()
})

const availableAuthors = computed<Array<string>>(() => {
  if (!graphData.value)
    return []
  return [...new Set(graphData.value.nodes.flatMap(n => n.authors || []))].sort()
})

// Extract available maps (nodes with isMap: true)
const availableMaps = computed<Array<{ id: string, title: string }>>(() => {
  if (!graphData.value)
    return []
  return graphData.value.nodes
    .filter(n => n.isMap)
    .map(n => ({ id: n.id, title: n.title }))
    .sort((a, b) => a.title.localeCompare(b.title))
})

// Build connectivity map for orphan detection
const connectedNodeIds = computed(() => {
  if (!graphData.value)
    return new Set<string>()
  const connected = new Set<string>()
  for (const edge of graphData.value.edges) {
    connected.add(getEdgeNodeId(edge.source))
    connected.add(getEdgeNodeId(edge.target))
  }
  return connected
})

// Filter helpers
function passesTagFilter(node: FullGraphNode, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true
  return selectedTags.some(tag => node.tags.includes(tag))
}

function passesAuthorFilter(node: FullGraphNode, selectedAuthors: string[]): boolean {
  if (selectedAuthors.length === 0) return true
  return selectedAuthors.some(author => (node.authors || []).includes(author))
}

function passesMapFilter(node: FullGraphNode, selectedMaps: string[]): boolean {
  if (selectedMaps.length === 0) return true
  const isSelectedMap = selectedMaps.includes(node.id)
  const belongsToSelectedMap = selectedMaps.some(mapId => (node.maps || []).includes(mapId))
  return isSelectedMap || belongsToSelectedMap
}

// Apply filters to nodes
const filteredNodes = computed(() => {
  if (!graphData.value) return []

  const { types, tags, authors, maps, showOrphans } = filterState.value

  return graphData.value.nodes.filter((node) => {
    if (!types.includes(node.type)) return false
    if (!passesTagFilter(node, tags)) return false
    if (!passesAuthorFilter(node, authors)) return false
    if (!passesMapFilter(node, maps)) return false
    if (!showOrphans && !connectedNodeIds.value.has(node.id)) return false
    return true
  })
})

// Filter edges to only include those between visible nodes
const filteredEdges = computed(() => {
  if (!graphData.value)
    return []

  const visibleIds = new Set(filteredNodes.value.map(n => n.id))

  return graphData.value.edges.filter((edge) => {
    const sourceId = getEdgeNodeId(edge.source)
    const targetId = getEdgeNodeId(edge.target)
    return visibleIds.has(sourceId) && visibleIds.has(targetId)
  })
})

// Combined filtered graph data
const filteredGraphData = computed<FullGraphData | null>(() => {
  if (!graphData.value)
    return null
  return {
    nodes: filteredNodes.value,
    edges: filteredEdges.value,
  }
})

// Close panel with Escape key
onKeyStroke('Escape', () => {
  selectedNode.value = null
})

// Drawer open state tied to selectedNode
const drawerOpen = computed({
  get: () => !!selectedNode.value,
  set: (val) => {
    if (!val)
      selectedNode.value = null
  },
})

const outgoingLinks = computed(() => {
  if (!selectedNode.value || !graphData.value)
    return []
  const targetIds = graphData.value.edges
    .filter(e => getEdgeNodeId(e.source) === selectedNode.value?.id)
    .map(e => getEdgeNodeId(e.target))
  return graphData.value.nodes.filter(n => targetIds.includes(n.id))
})

const backlinks = computed(() => {
  if (!selectedNode.value || !graphData.value)
    return []
  const sourceIds = graphData.value.edges
    .filter(e => getEdgeNodeId(e.target) === selectedNode.value?.id)
    .map(e => getEdgeNodeId(e.source))
  return graphData.value.nodes.filter(n => sourceIds.includes(n.id))
})

function handleSelectNode(node: UnifiedGraphNode) {
  // Look up the full node from original data to get proper FullGraphNode type
  const fullNode = graphData.value?.nodes.find(n => n.id === node.id)
  if (fullNode) {
    selectedNode.value = fullNode
  }
}

function handleClosePanel() {
  selectedNode.value = null
}

// Mobile filter drawer
const showMobileFilters = ref(false)
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden">
    <!-- Full-canvas graph -->
    <ClientOnly>
      <KnowledgeGraph
        ref="graphRef"
        :graph-data="filteredGraphData"
        :selected-id="selectedNode?.id"
        class="!h-screen"
        @select="handleSelectNode"
        @zoom-change="zoomLevel = $event"
      />
      <template #fallback>
        <div class="w-full h-screen flex items-center justify-center">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-[var(--ui-text-muted)]" />
        </div>
      </template>
    </ClientOnly>

    <!-- Floating title/stats overlay (top-left) -->
    <div class="absolute top-4 left-4 z-10">
      <div class="glass-panel px-4 py-3">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors">
            <UIcon name="i-lucide-arrow-left" class="size-4 text-[var(--ui-text-muted)]" />
          </NuxtLink>
          <div>
            <h1 class="text-sm font-semibold">Knowledge Graph</h1>
            <p class="text-xs text-[var(--ui-text-muted)]">
              {{ filteredNodes.length }} nodes &bull; {{ filteredEdges.length }} connections
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Collapsible filter panel (top-right) - Desktop -->
    <div v-if="!isMobile" class="absolute top-4 right-4 z-10">
      <div class="glass-panel">
        <!-- Collapse toggle header -->
        <button
          class="flex items-center justify-between w-full px-4 py-2 text-xs font-medium text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors"
          @click="filtersExpanded = !filtersExpanded"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-lucide-filter" class="size-3.5" />
            Filters
          </span>
          <UIcon
            :name="filtersExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-3.5 transition-transform"
          />
        </button>
        <!-- Filter content -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="filtersExpanded" class="overflow-hidden">
            <div class="px-4 pb-3 pt-1">
              <GraphFilters
                :available-tags="availableTags"
                :available-types="availableTypes"
                :available-authors="availableAuthors"
                :available-maps="availableMaps"
                class="!flex-col !items-start !gap-4"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Zoom controls - glassmorphism panel (bottom-left) -->
    <div class="absolute bottom-4 left-4 z-10">
      <div class="glass-panel flex items-center gap-1 p-1">
        <UTooltip text="Fit all nodes">
          <UButton
            icon="i-lucide-maximize-2"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Fit all nodes"
            @click="graphRef?.fitAll()"
          />
        </UTooltip>
        <div class="w-px h-4 bg-white/10" />
        <UTooltip text="Zoom out">
          <UButton
            icon="i-lucide-minus"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Zoom out"
            @click="graphRef?.zoomOut()"
          />
        </UTooltip>
        <UTooltip text="Reset zoom">
          <button
            class="px-2 py-1 text-xs font-medium text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors min-w-[3rem] text-center"
            @click="graphRef?.fitAll()"
          >
            {{ Math.round(zoomLevel * 100) }}%
          </button>
        </UTooltip>
        <UTooltip text="Zoom in">
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Zoom in"
            @click="graphRef?.zoomIn()"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Mobile filter button (bottom-right) -->
    <div v-if="isMobile" class="absolute bottom-4 right-4 z-10">
      <button class="glass-panel p-3" @click="showMobileFilters = true">
        <UIcon name="i-lucide-filter" class="size-5" />
      </button>
    </div>

    <!-- Desktop: Floating sidebar for node details -->
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <GraphNodePanel
        v-if="selectedNode && !isMobile"
        :node="selectedNode"
        :outgoing-links="outgoingLinks"
        :backlinks="backlinks"
        class="fixed top-4 right-4 bottom-4 z-20 glass-panel !bg-black/60"
        @close="handleClosePanel"
        @select-node="handleSelectNode"
      />
    </Transition>

    <!-- Mobile: Filter drawer -->
    <UDrawer
      v-if="isMobile"
      v-model:open="showMobileFilters"
      title="Filters"
      :ui="{
        content: 'max-h-[70vh]',
      }"
    >
      <div class="p-4">
        <GraphFilters
          :available-tags="availableTags"
          :available-types="availableTypes"
          :available-authors="availableAuthors"
          :available-maps="availableMaps"
        />
      </div>
    </UDrawer>

    <!-- Mobile: Node details modal (centered) -->
    <UModal
      v-if="isMobile"
      v-model:open="drawerOpen"
      :close="false"
      :ui="{
        overlay: 'bg-black/40 backdrop-blur-sm',
        content: 'h-[70vh] w-[calc(100vw-2rem)] bg-black/60 backdrop-blur-xl rounded-2xl flex flex-col border border-white/10',
        body: 'flex-1 overflow-auto p-0',
      }"
    >
      <template #body>
        <GraphNodePanel
          v-if="selectedNode"
          :node="selectedNode"
          :outgoing-links="outgoingLinks"
          :backlinks="backlinks"
          class="border-0 w-full h-full"
          @close="handleClosePanel"
          @select-node="handleSelectNode"
        />
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
</style>
