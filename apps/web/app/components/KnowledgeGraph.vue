<script setup lang="ts">
import { ref } from 'vue'
import BaseGraph from '~/components/BaseGraph.vue'
import type { FullGraphData, UnifiedGraphNode } from '~/types/graph'
import type { BaseGraphOptions } from './BaseGraph.vue'

const props = defineProps<{
  graphData?: FullGraphData | null
  selectedId?: string | null
}>()

// Emit UnifiedGraphNode which contains all properties from both formats
const emit = defineEmits<{
  select: [node: UnifiedGraphNode]
  zoomChange: [level: number]
}>()

const baseGraphRef = ref<{
  zoomIn: () => void
  zoomOut: () => void
  fitAll: (padding?: number) => void
  getCurrentZoom: () => number
}>()

const graphOptions: BaseGraphOptions = {
  hexagonMaps: true,
  breathing: true,
  persistZoom: true,
  zoomExtent: [0.1, 4],
  labelVisibility: 'progressive',
}

defineExpose({
  fitAll: (padding?: number) => baseGraphRef.value?.fitAll(padding),
  zoomIn: () => baseGraphRef.value?.zoomIn(),
  zoomOut: () => baseGraphRef.value?.zoomOut(),
})
</script>

<template>
  <BaseGraph
    ref="baseGraphRef"
    :full-graph-data="graphData"
    mode="freeform"
    :selected-id="selectedId"
    :options="graphOptions"
    @select="emit('select', $event)"
    @zoom-change="emit('zoomChange', $event)"
  />
</template>

<style scoped>
:deep(.graph-container) {
  width: 100%;
  height: 100%;
}
</style>
