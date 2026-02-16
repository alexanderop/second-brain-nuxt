<script setup lang="ts">
import { computed } from 'vue'
import BaseGraph from '~/components/BaseGraph.vue'
import type { NoteGraphData } from '~/types/graph'
import type { BaseGraphOptions } from './BaseGraph.vue'

const props = defineProps<{
  graphData: NoteGraphData | null | undefined
}>()

const emit = defineEmits<{
  navigate: [slug: string]
}>()

const hasConnections = computed(() =>
  props.graphData && props.graphData.connected.length > 0,
)

const graphOptions: BaseGraphOptions = {
  labelVisibility: 'center-only',
  breathing: false,
  persistZoom: false,
  zoomExtent: [0.5, 2],
}
</script>

<template>
  <section
    v-if="hasConnections"
    class="mt-12 pt-8 border-t border-[var(--ui-border)]"
  >
    <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
      Connections ({{ graphData?.connected.length ?? 0 }})
    </h2>
    <div class="note-graph-wrapper">
      <BaseGraph
        :note-graph-data="graphData"
        mode="radial"
        :options="graphOptions"
        @navigate="emit('navigate', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.note-graph-wrapper {
  height: 300px;
  background: var(--ui-bg-elevated);
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border);
  overflow: hidden;
}
</style>
