<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
  summary?: string
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

const { data: graphData } = await useAsyncData<GraphData>('graph-data', () => $fetch('/api/graph'))

const selectedNode = ref<GraphNode | null>(null)

const outgoingLinks = computed(() => {
  if (!selectedNode.value || !graphData.value)
    return []
  const targetIds = graphData.value.edges
    .filter(e => getEdgeNodeId(e.source) === selectedNode.value!.id)
    .map(e => getEdgeNodeId(e.target))
  return graphData.value.nodes.filter(n => targetIds.includes(n.id))
})

const backlinks = computed(() => {
  if (!selectedNode.value || !graphData.value)
    return []
  const sourceIds = graphData.value.edges
    .filter(e => getEdgeNodeId(e.target) === selectedNode.value!.id)
    .map(e => getEdgeNodeId(e.source))
  return graphData.value.nodes.filter(n => sourceIds.includes(n.id))
})

function handleSelectNode(node: GraphNode) {
  selectedNode.value = node
}

function handleClosePanel() {
  selectedNode.value = null
}
</script>

<template>
  <div class="flex gap-0 -mr-6">
    <!-- Main content area -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">
          Knowledge Graph
        </h1>
        <p class="text-sm text-[var(--ui-text-muted)]">
          Click a node for details • Drag to move • Scroll to zoom
        </p>
      </div>
      <ClientOnly>
        <KnowledgeGraph
          :selected-id="selectedNode?.id"
          @select="handleSelectNode"
        />
        <template #fallback>
          <div class="w-full h-[calc(100vh-12rem)] rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-[var(--ui-text-muted)]" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Sidebar panel -->
    <GraphNodePanel
      v-if="selectedNode"
      :node="selectedNode"
      :outgoing-links="outgoingLinks"
      :backlinks="backlinks"
      @close="handleClosePanel"
      @select-node="handleSelectNode"
    />
  </div>
</template>
