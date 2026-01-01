<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
  summary?: string
  connections?: number
}

// Edge source/target can be string (from API) or object (after D3 processes it)
interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
}

interface GraphData {
  nodes: Array<GraphNode>
  edges: Array<GraphEdge>
}

// Helper to get ID from edge endpoint (handles both string and object)
function getEdgeNodeId(endpoint: string | GraphNode): string {
  return typeof endpoint === 'string' ? endpoint : endpoint.id
}

useSeoMeta({
  title: 'Graph - Second Brain',
})

const { data: graphData } = await useAsyncData<GraphData>('graph-data', () => $fetch<GraphData>('/api/graph'))

const selectedNode = ref<GraphNode | null>(null)

// Template ref for KnowledgeGraph component (for zoom controls)
const graphRef = ref<{ fitAll: () => void, zoomIn: () => void, zoomOut: () => void }>()

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

// Apply filters to nodes
const filteredNodes = computed(() => {
  if (!graphData.value)
    return []

  return graphData.value.nodes.filter((node) => {
    // Type filter
    if (!filterState.value.types.includes(node.type)) {
      return false
    }

    // Tag filter (node must have at least one selected tag)
    if (filterState.value.tags.length > 0) {
      const hasMatchingTag = filterState.value.tags.some(tag => node.tags.includes(tag))
      if (!hasMatchingTag)
        return false
    }

    // Orphan filter
    if (!filterState.value.showOrphans) {
      const isOrphan = !connectedNodeIds.value.has(node.id)
      if (isOrphan)
        return false
    }

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
const filteredGraphData = computed<GraphData | null>(() => {
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

function handleSelectNode(node: GraphNode) {
  selectedNode.value = node
}

function handleClosePanel() {
  selectedNode.value = null
}

// Mobile filter drawer
const showMobileFilters = ref(false)
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-[var(--ui-bg-elevated)]">
          <UIcon name="i-lucide-network" class="size-5 text-[var(--ui-primary)]" />
        </div>
        <div>
          <h1 class="text-xl font-semibold">
            Knowledge Graph
          </h1>
          <p class="text-xs text-[var(--ui-text-muted)] hidden sm:block">
            {{ filteredNodes.length }} nodes &bull; {{ filteredEdges.length }} connections
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- Mobile filter button -->
        <UButton
          v-if="isMobile"
          variant="soft"
          size="sm"
          icon="i-lucide-filter"
          aria-label="Filter"
          @click="showMobileFilters = true"
        />
        <p class="text-xs text-[var(--ui-text-dimmed)] hidden md:block">
          Click &bull; Drag &bull; Scroll to zoom
        </p>
      </div>
    </div>

    <!-- Filters row (desktop) -->
    <div
      v-if="!isMobile"
      class="mb-4 pb-4 border-b border-[var(--ui-border)]"
    >
      <GraphFilters
        :available-tags="availableTags"
        :available-types="availableTypes"
      />
    </div>

    <!-- Graph (full width) with zoom controls -->
    <div class="relative">
      <ClientOnly>
        <KnowledgeGraph
          ref="graphRef"
          :graph-data="filteredGraphData"
          :selected-id="selectedNode?.id"
          @select="handleSelectNode"
        />
        <template #fallback>
          <div class="w-full h-[calc(100vh-12rem)] rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-[var(--ui-text-muted)]" />
          </div>
        </template>
      </ClientOnly>

      <!-- Zoom controls -->
      <div class="absolute bottom-4 right-4 z-10 flex gap-1">
        <UTooltip text="Fit all nodes">
          <UButton
            icon="i-lucide-maximize-2"
            color="neutral"
            variant="soft"
            size="sm"
            aria-label="Fit all nodes"
            @click="graphRef?.fitAll()"
          />
        </UTooltip>
        <UTooltip text="Zoom in">
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="soft"
            size="sm"
            aria-label="Zoom in"
            @click="graphRef?.zoomIn()"
          />
        </UTooltip>
        <UTooltip text="Zoom out">
          <UButton
            icon="i-lucide-minus"
            color="neutral"
            variant="soft"
            size="sm"
            aria-label="Zoom out"
            @click="graphRef?.zoomOut()"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Desktop: Fixed sidebar for node details -->
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
        class="fixed top-16 right-0 h-[calc(100vh-4rem)] shadow-xl z-20"
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
        />
      </div>
    </UDrawer>

    <!-- Mobile: Node details drawer -->
    <UDrawer
      v-if="isMobile"
      v-model:open="drawerOpen"
      :ui="{
        content: 'max-h-[70vh]',
      }"
    >
      <GraphNodePanel
        v-if="selectedNode"
        :node="selectedNode"
        :outgoing-links="outgoingLinks"
        :backlinks="backlinks"
        class="border-0 w-full"
        @close="handleClosePanel"
        @select-node="handleSelectNode"
      />
    </UDrawer>
  </div>
</template>
