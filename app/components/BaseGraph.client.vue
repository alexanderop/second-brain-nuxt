<script setup lang="ts">
import { ref, computed, watch, shallowRef, onMounted, onUnmounted } from "vue";
import { useResizeObserver, useDebounceFn } from "@vueuse/core";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { drag } from "d3-drag";
import type { Simulation } from "d3-force";
import type { ZoomBehavior } from "d3-zoom";
import type { Selection } from "d3-selection";
import type {
  NoteGraphData,
  FullGraphData,
  UnifiedGraphNode,
  UnifiedGraphEdge,
} from "~/types/graph";
import { normalizeGraphData } from "~/utils/graphNormalize";
import { createRadialSimulation, createFreeformSimulation } from "~/utils/graphForces";
import { typeColors, getNodeColor, getGlowFilter, graphColors } from "~/utils/graphColors";
import {
  getHexagonPath,
  getNodeRadius,
  shouldShowLabel,
  getConnectedIds,
  getEdgeX,
  getEdgeY,
  fontScale,
  saveZoomTransform,
  loadZoomTransform,
  createClusteringForce,
  useGraphInteractions,
} from "~/composables/useGraphHelpers";

// Constants
const LEVEL2_OPACITY = 0.5;
const LEVEL2_EDGE_OPACITY = 0.25;
const LEVEL2_EDGE_WIDTH = 1;

// Options interface to reduce prop count
export interface BaseGraphOptions {
  nodeSizing?: "level" | "connections" | "fixed";
  nodeRadius?: number;
  hexagonMaps?: boolean;
  breathing?: boolean;
  breathingInterval?: number;
  persistZoom?: boolean;
  zoomStorageKey?: string;
  zoomExtent?: readonly [number, number];
  labelVisibility?: "always" | "hover" | "progressive" | "center-only";
}

const props = withDefaults(
  defineProps<{
    noteGraphData?: NoteGraphData | null;
    fullGraphData?: FullGraphData | null;
    mode?: "radial" | "freeform";
    selectedId?: string | null;
    options?: BaseGraphOptions;
  }>(),
  {
    mode: "freeform",
  },
);

const emit = defineEmits<{
  select: [node: UnifiedGraphNode];
  navigate: [slug: string];
  zoomChange: [level: number];
}>();

// Compute effective options based on mode
const isRadial = computed(() => props.mode === "radial");
const opts = computed(() => props.options ?? {});

const effectiveHexagonMaps = computed(() => opts.value.hexagonMaps ?? !isRadial.value);
const effectiveBreathing = computed(() => opts.value.breathing ?? !isRadial.value);
const effectivePersistZoom = computed(() => opts.value.persistZoom ?? !isRadial.value);
const effectiveZoomExtent = computed(
  (): readonly [number, number] => opts.value.zoomExtent ?? (isRadial.value ? [0.5, 2] : [0.1, 4]),
);
const effectiveLabelVisibility = computed(
  () => opts.value.labelVisibility ?? (isRadial.value ? "center-only" : "progressive"),
);
const effectiveNodeSizing = computed(
  () => opts.value.nodeSizing ?? (isRadial.value ? "level" : "connections"),
);
const effectiveNodeRadius = computed(() => opts.value.nodeRadius ?? 10);
const effectiveBreathingInterval = computed(() => opts.value.breathingInterval ?? 3000);
const effectiveZoomStorageKey = computed(() => opts.value.zoomStorageKey ?? "graph-zoom-transform");

// Normalize data
const normalizedData = computed(() => normalizeGraphData(props.noteGraphData, props.fullGraphData));
const hasData = computed(() => normalizedData.value && normalizedData.value.nodes.length > 0);

// Refs
const container = ref<HTMLDivElement>();
const hoveredId = ref<string | null>(null);
const isDragging = ref(false);
const currentZoom = ref(1);
const simulationSettled = ref(false);
const simulationRef = shallowRef<Simulation<UnifiedGraphNode, UnifiedGraphEdge> | null>(null);
const svgRef = shallowRef<Selection<SVGSVGElement, unknown, null, undefined>>();
const zoomRef = shallowRef<ZoomBehavior<SVGSVGElement, unknown>>();
const currentNodes = shallowRef<UnifiedGraphNode[]>([]);
const widthRef = ref(0);
const heightRef = ref(0);

// Graph interactions composable
const {
  zoomToFit,
  zoomIn,
  zoomOut,
  startBreathing,
  stopBreathing,
  attachPanListeners,
  detachPanListeners,
} = useGraphInteractions(
  container,
  svgRef,
  zoomRef,
  currentNodes,
  simulationRef,
  widthRef,
  heightRef,
  isDragging,
  hoveredId,
  effectiveBreathing,
  effectiveBreathingInterval,
);

// Main initialization
function initGraph() {
  if (!container.value || !normalizedData.value) return;

  simulationSettled.value = false;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  widthRef.value = width;
  heightRef.value = height;

  select(container.value).select("svg").remove();

  const nodes: UnifiedGraphNode[] = normalizedData.value.nodes.map((n) => ({ ...n }));
  const edges: UnifiedGraphEdge[] = normalizedData.value.edges.map((e) => ({ ...e }));
  currentNodes.value = nodes;

  const maxConnections = Math.max(1, ...nodes.map((n) => n.connections ?? 0));
  const radiusScale = (node: UnifiedGraphNode) =>
    getNodeRadius(node, maxConnections, effectiveNodeSizing.value, effectiveNodeRadius.value);

  const svg = select(container.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("role", "img")
    .attr(
      "aria-label",
      `Knowledge graph with ${nodes.length} nodes and ${edges.length} connections`,
    );
  svgRef.value = svg;

  // Glow filters
  const defs = svg.append("defs");
  Object.entries(typeColors).forEach(([type]) => {
    const filter = defs
      .append("filter")
      .attr("id", `glow-${type}`)
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", isRadial.value ? "2" : "3")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  });

  const g = svg.append("g");

  // Zoom
  const zoomExtent = effectiveZoomExtent.value;
  const zoomBehavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([zoomExtent[0], zoomExtent[1]])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      currentZoom.value = event.transform.k;
      emit("zoomChange", event.transform.k);
      saveZoomTransform(event.transform, effectivePersistZoom.value, effectiveZoomStorageKey.value);
    });
  zoomRef.value = zoomBehavior;
  svg.call(zoomBehavior);
  svg.on("dblclick.zoom", null);
  if (!isRadial.value) svg.on("dblclick", () => zoomToFit());

  // Simulation
  const simulation = isRadial.value
    ? createRadialSimulation(nodes, edges, width, height, {}, radiusScale)
    : createFreeformSimulation(
        nodes,
        edges,
        width,
        height,
        {},
        radiusScale,
        createClusteringForce(nodes),
      );
  simulationRef.value = simulation;

  // Edges
  const link = g
    .append("g")
    .selectAll("line")
    .data(edges)
    .join("line")
    .attr("stroke", graphColors.edge)
    .attr("stroke-opacity", (d) =>
      isRadial.value && d.level === 2 ? LEVEL2_EDGE_OPACITY : isRadial.value ? 0.5 : 0.3,
    )
    .attr("stroke-width", (d) => (isRadial.value && d.level === 2 ? LEVEL2_EDGE_WIDTH : 1.5))
    .attr("stroke-linecap", "round")
    .attr("class", "graph-edge");

  // Nodes
  const node = g
    .append("g")
    .selectAll<SVGGElement, UnifiedGraphNode>("g")
    .data(nodes)
    .join("g")
    .attr("data-node-id", (d) => d.id)
    .attr("cursor", "pointer");

  // Drag
  const dragBehavior = drag<SVGGElement, UnifiedGraphNode>()
    .on("start", (event) => {
      isDragging.value = true;
      stopBreathing();
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", (event) => {
      isDragging.value = false;
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      setTimeout(() => startBreathing(), 1000);
    });
  node.call(dragBehavior);

  // Click/hover
  node
    .on("click", (_, d) => {
      if (isRadial.value && !d.isCenter) {
        emit("navigate", d.id);
        return;
      }
      emit("select", d);
    })
    .on("mouseenter", function (_, d) {
      hoveredId.value = d.id;
      select(this)
        .select(".node-shape")
        .transition()
        .duration(100)
        .attr("transform", "scale(1.15)");
      if (!props.selectedId) applyHighlight(d.id);
    })
    .on("mouseleave", function () {
      hoveredId.value = null;
      select(this).select(".node-shape").transition().duration(100).attr("transform", "scale(1)");
      applyHighlight(props.selectedId ?? null);
    });

  // Node shape helper
  function getNodeStyle(d: UnifiedGraphNode) {
    const isL2 = isRadial.value && d.level === 2;
    const opacity = isL2 ? LEVEL2_OPACITY : isRadial.value ? 0.9 : 0.85;
    const stroke = d.isCenter
      ? "#ffffff"
      : d.id === props.selectedId
        ? graphColors.selected
        : "transparent";
    const strokeWidth = d.isCenter || d.id === props.selectedId ? 2 : 0;
    const filter = isL2 ? null : getGlowFilter(d.type);
    return { opacity, stroke, strokeWidth, filter, fill: getNodeColor(d.type).fill };
  }

  // Node shapes
  node.each(function (d) {
    const nodeGroup = select(this);
    const radius = radiusScale(d);
    const style = getNodeStyle(d);

    if (effectiveHexagonMaps.value && d.isMap) {
      nodeGroup
        .append("path")
        .attr("d", getHexagonPath(radius * 1.2))
        .attr("fill", style.fill)
        .attr("fill-opacity", style.opacity)
        .attr("stroke", style.stroke)
        .attr("stroke-width", style.strokeWidth)
        .attr("filter", style.filter)
        .attr("class", "node-shape");
      return;
    }
    nodeGroup
      .append("circle")
      .attr("r", radius)
      .attr("fill", style.fill)
      .attr("fill-opacity", style.opacity)
      .attr("stroke", style.stroke)
      .attr("stroke-width", style.strokeWidth)
      .attr("filter", style.filter)
      .attr("class", "node-shape");
  });

  // Labels
  node
    .append("text")
    .text((d) => d.title)
    .attr("x", (d) => radiusScale(d) + (isRadial.value ? 5 : 4))
    .attr("y", 4)
    .attr("font-size", (d) => {
      if (!isRadial.value) return `${fontScale(radiusScale(d))}px`;
      if (d.isCenter) return "13px";
      return d.level === 2 ? "10px" : "11px";
    })
    .attr("font-weight", (d) => (d.isCenter ? "600" : "400"))
    .attr("fill", graphColors.text)
    .attr("stroke", "var(--ui-bg)")
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke")
    .attr("stroke-linejoin", "round")
    .attr("class", "node-label")
    .attr("opacity", (d) =>
      shouldShowLabel(d, currentZoom.value, false, effectiveLabelVisibility.value) ? 1 : 0,
    );

  // Highlight function
  function applyHighlight(activeId: string | null) {
    const connectedIds = getConnectedIds(activeId, edges);
    const isActive = (id: string) => id === activeId || connectedIds.has(id);

    node
      .selectAll<SVGElement, UnifiedGraphNode>(".node-shape")
      .transition()
      .duration(100)
      .attr("opacity", (d) =>
        activeId
          ? isActive(d.id)
            ? 1
            : 0.1
          : isRadial.value && d.level === 2
            ? LEVEL2_OPACITY
            : 1,
      )
      .attr("stroke", (d) =>
        d.isCenter ? "#ffffff" : d.id === props.selectedId ? graphColors.selected : "transparent",
      )
      .attr("stroke-width", (d) => (d.isCenter || d.id === props.selectedId ? 2 : 0));

    node
      .selectAll<SVGTextElement, UnifiedGraphNode>(".node-label")
      .transition()
      .duration(100)
      .attr("opacity", (d) => {
        if (activeId) return isActive(d.id) ? 1 : 0.1;
        return shouldShowLabel(
          d,
          currentZoom.value,
          d.id === hoveredId.value || d.id === props.selectedId,
          effectiveLabelVisibility.value,
        )
          ? 1
          : 0;
      });

    link
      .transition()
      .duration(100)
      .attr("stroke", (d) => {
        if (!activeId) return graphColors.edge;
        const sId = typeof d.source === "string" ? d.source : d.source.id;
        const tId = typeof d.target === "string" ? d.target : d.target.id;
        return sId === activeId || tId === activeId ? graphColors.connectedEdge : graphColors.edge;
      })
      .attr("stroke-opacity", (d) => {
        const sId = typeof d.source === "string" ? d.source : d.source.id;
        const tId = typeof d.target === "string" ? d.target : d.target.id;
        if (!activeId)
          return isRadial.value && d.level === 2 ? LEVEL2_EDGE_OPACITY : isRadial.value ? 0.5 : 0.3;
        return sId === activeId || tId === activeId ? 0.9 : 0.08;
      })
      .attr("stroke-width", (d) => {
        const sId = typeof d.source === "string" ? d.source : d.source.id;
        const tId = typeof d.target === "string" ? d.target : d.target.id;
        if (!activeId) return isRadial.value && d.level === 2 ? LEVEL2_EDGE_WIDTH : 1.5;
        return sId === activeId || tId === activeId
          ? 2.5
          : isRadial.value && d.level === 2
            ? LEVEL2_EDGE_WIDTH
            : 1;
      });
  }

  // Tick
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => getEdgeX(d.source))
      .attr("y1", (d) => getEdgeY(d.source))
      .attr("x2", (d) => getEdgeX(d.target))
      .attr("y2", (d) => getEdgeY(d.target));
    node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
  });

  // End
  simulation.on("end", () => {
    simulationSettled.value = true;
    const saved = loadZoomTransform(effectivePersistZoom.value, effectiveZoomStorageKey.value);
    if (saved && svgRef.value && zoomRef.value) {
      svgRef.value.call(zoomRef.value.transform, saved);
      emit("zoomChange", saved.k);
      startBreathing();
      return;
    }
    if (!isRadial.value) zoomToFit();
    startBreathing();
  });

  if (props.selectedId) setTimeout(() => applyHighlight(props.selectedId ?? null), 100);
  emit("zoomChange", 1);
}

// Lifecycle
onMounted(() => {
  initGraph();
  attachPanListeners();
});

onUnmounted(() => {
  stopBreathing();
  detachPanListeners();
});

// Watchers
watch(
  () => props.selectedId,
  (newId) => {
    if (!container.value || !normalizedData.value) return;
    const edges = normalizedData.value.edges;
    const connectedIds = getConnectedIds(newId ?? null, edges);
    const isActive = (id: string) => id === newId || connectedIds.has(id);

    select(container.value)
      .selectAll<SVGElement, UnifiedGraphNode>(".node-shape")
      .transition()
      .duration(100)
      .attr("opacity", (d) =>
        newId ? (isActive(d.id) ? 1 : 0.1) : isRadial.value && d.level === 2 ? LEVEL2_OPACITY : 1,
      )
      .attr("stroke", (d) =>
        d.isCenter ? "#ffffff" : d.id === newId ? graphColors.selected : "transparent",
      )
      .attr("stroke-width", (d) => (d.isCenter || d.id === newId ? 2 : 0));
  },
);

watch([() => props.noteGraphData, () => props.fullGraphData], () => initGraph());
useResizeObserver(container, useDebounceFn(initGraph, 200));

// Expose
defineExpose({
  zoomIn,
  zoomOut,
  fitAll: zoomToFit,
  getCurrentZoom: () => currentZoom.value,
  restartSimulation: () => simulationRef.value?.alpha(0.3).restart(),
  stopSimulation: () => simulationRef.value?.stop(),
  isSimulationSettled: () => simulationSettled.value,
});
</script>

<template>
  <div class="base-graph" data-testid="graph">
    <slot
      v-if="hasData"
      name="header"
      :node-count="normalizedData?.nodes.length ?? 0"
      :edge-count="normalizedData?.edges.length ?? 0"
    />

    <div v-if="hasData" ref="container" class="graph-container" data-testid="graph-container" />

    <slot
      v-if="hasData"
      name="controls"
      :zoom-in="zoomIn"
      :zoom-out="zoomOut"
      :fit-all="zoomToFit"
      :zoom-level="currentZoom"
    />

    <slot v-if="!hasData" name="empty">
      <div class="empty-state" data-testid="graph-empty">
        <span class="text-[var(--ui-text-muted)]">No connections</span>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.base-graph {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.graph-container {
  flex: 1;
  min-height: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}
</style>
