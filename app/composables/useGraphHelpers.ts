import { ref, type Ref, type ShallowRef } from "vue";
import { zoomIdentity, zoomTransform } from "d3-zoom";
import { scalePow, scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import type { ZoomBehavior, ZoomTransform } from "d3-zoom";
import type { Selection } from "d3-selection";
import type { Simulation } from "d3-force";
import type { UnifiedGraphNode, UnifiedGraphEdge } from "~/types/graph";
import { tryCatch } from "#shared/utils/tryCatch";

// Constants
const RADIAL_SIZES = { center: 18, level1: 10, level2: 7 };
const FREEFORM_SIZE_RANGE: [number, number] = [8, 40];

// Hexagon path for map nodes
export function getHexagonPath(radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M${points.join("L")}Z`;
}

// Node radius calculation
export function getNodeRadius(
  node: UnifiedGraphNode,
  maxConnections: number,
  sizing: "level" | "connections" | "fixed",
  fixedRadius: number,
): number {
  if (sizing === "fixed") return fixedRadius;
  if (sizing === "level") {
    if (node.isCenter) return RADIAL_SIZES.center;
    return node.level === 2 ? RADIAL_SIZES.level2 : RADIAL_SIZES.level1;
  }
  // connections sizing
  const scale = scalePow()
    .exponent(0.7)
    .domain([0, Math.max(1, maxConnections)])
    .range(FREEFORM_SIZE_RANGE);
  return scale(node.connections ?? 0);
}

// Label visibility
export function shouldShowLabel(
  node: UnifiedGraphNode,
  zoom: number,
  isActive: boolean,
  labelVisibility: "always" | "hover" | "progressive" | "center-only",
): boolean {
  if (isActive) return true;
  if (labelVisibility === "always") return true;
  if (labelVisibility === "hover") return false;
  if (labelVisibility === "center-only") return !!node.isCenter;
  // progressive
  const connections = node.connections ?? 0;
  if (zoom < 0.5) return connections >= 5;
  if (zoom < 1.0) return connections >= 2;
  return true;
}

// Get connected node IDs
export function getConnectedIds(nodeId: string | null, edges: UnifiedGraphEdge[]): Set<string> {
  const connected = new Set<string>();
  if (!nodeId) return connected;
  for (const edge of edges) {
    const sourceId = typeof edge.source === "string" ? edge.source : edge.source.id;
    const targetId = typeof edge.target === "string" ? edge.target : edge.target.id;
    if (sourceId === nodeId) connected.add(targetId);
    if (targetId === nodeId) connected.add(sourceId);
  }
  return connected;
}

// Edge helpers
export function getEdgeX(endpoint: string | UnifiedGraphNode): number {
  return typeof endpoint === "string" ? 0 : (endpoint.x ?? 0);
}

export function getEdgeY(endpoint: string | UnifiedGraphNode): number {
  return typeof endpoint === "string" ? 0 : (endpoint.y ?? 0);
}

// Font scale for labels (stateless, created once)
export const fontScale = scaleLinear().domain(FREEFORM_SIZE_RANGE).range([10, 16]);

// Fit transform calculation
export function calculateFitTransform(
  nodes: UnifiedGraphNode[],
  width: number,
  height: number,
  padding: number,
) {
  const xExtent = extent(nodes, (d) => d.x);
  const yExtent = extent(nodes, (d) => d.y);
  const [xMin, xMax] = [xExtent[0] ?? 0, xExtent[1] ?? 0];
  const [yMin, yMax] = [yExtent[0] ?? 0, yExtent[1] ?? 0];
  const boundsWidth = xMax - xMin || 1;
  const boundsHeight = yMax - yMin || 1;
  const scale = Math.min(
    (width - padding * 2) / boundsWidth,
    (height - padding * 2) / boundsHeight,
    1.5,
  );
  const centerX = (xMin + xMax) / 2;
  const centerY = (yMin + yMax) / 2;
  return {
    scale,
    translateX: width / 2 - centerX * scale,
    translateY: height / 2 - centerY * scale,
  };
}

// Zoom persistence
interface ZoomData {
  k: number;
  x: number;
  y: number;
}

function isZoomData(data: unknown): data is ZoomData {
  if (typeof data !== "object" || data === null) return false;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- type guard requires narrowing from unknown
  const obj = data as Record<string, unknown>;
  return (
    "k" in data &&
    typeof obj.k === "number" &&
    "x" in data &&
    typeof obj.x === "number" &&
    "y" in data &&
    typeof obj.y === "number"
  );
}

export function saveZoomTransform(transform: ZoomTransform, persistZoom: boolean, storageKey: string) {
  if (!persistZoom) return;
  sessionStorage.setItem(
    storageKey,
    JSON.stringify({
      k: transform.k,
      x: transform.x,
      y: transform.y,
    }),
  );
}

export function loadZoomTransform(persistZoom: boolean, storageKey: string): ZoomTransform | null {
  if (!persistZoom) return null;
  const stored = sessionStorage.getItem(storageKey);
  if (!stored) return null;
  const [parseError, parsed] = tryCatch(() => JSON.parse(stored));
  if (parseError) return null;
  if (!isZoomData(parsed)) return null;
  return zoomIdentity.translate(parsed.x, parsed.y).scale(parsed.k);
}

// Clustering force helpers
function calculateMapCentroid(maps: string[], mapPositions: Map<string, { x: number; y: number }>) {
  let x = 0,
    y = 0,
    count = 0;
  for (const mapId of maps) {
    const pos = mapPositions.get(mapId);
    if (pos) {
      x += pos.x;
      y += pos.y;
      count++;
    }
  }
  return count > 0 ? { x: x / count, y: y / count } : null;
}

function applyClusterForce(
  node: UnifiedGraphNode,
  mapPositions: Map<string, { x: number; y: number }>,
  alpha: number,
) {
  if (!node.maps || node.maps.length === 0 || node.isMap) return;
  const centroid = calculateMapCentroid(node.maps, mapPositions);
  if (!centroid) return;
  const strength = 0.15 * alpha;
  node.vx = (node.vx ?? 0) + (centroid.x - (node.x ?? 0)) * strength;
  node.vy = (node.vy ?? 0) + (centroid.y - (node.y ?? 0)) * strength;
}

export function createClusteringForce(nodes: UnifiedGraphNode[]) {
  // Pre-filter map nodes once; their x/y are read fresh each tick
  const mapNodes = nodes.filter((n) => n.isMap);
  const nonMapNodes = nodes.filter((n) => !n.isMap && n.maps && n.maps.length > 0);
  return (alpha: number) => {
    const mapPositions = new Map<string, { x: number; y: number }>();
    for (const node of mapNodes) {
      mapPositions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
    }
    for (const node of nonMapNodes) applyClusterForce(node, mapPositions, alpha);
  };
}

// Composable for zoom controls, middle-mouse panning, and breathing animation
export function useGraphInteractions(
  container: Ref<HTMLDivElement | undefined>,
  svgRef: ShallowRef<Selection<SVGSVGElement, unknown, null, undefined> | undefined>,
  zoomRef: ShallowRef<ZoomBehavior<SVGSVGElement, unknown> | undefined>,
  currentNodes: ShallowRef<UnifiedGraphNode[]>,
  simulationRef: ShallowRef<Simulation<UnifiedGraphNode, UnifiedGraphEdge> | null>,
  widthRef: Ref<number>,
  heightRef: Ref<number>,
  isDragging: Ref<boolean>,
  hoveredId: Ref<string | null>,
  effectiveBreathing: Ref<boolean>,
  effectiveBreathingInterval: Ref<number>,
) {
  const isMiddleMousePanning = ref(false);
  const panStartPos = ref({ x: 0, y: 0 });
  const breathingIntervalRef = ref<ReturnType<typeof setInterval> | null>(null);

  function zoomToFit(padding = 60) {
    if (!currentNodes.value.length || !svgRef.value || !zoomRef.value) return;
    const { scale, translateX, translateY } = calculateFitTransform(
      currentNodes.value,
      widthRef.value,
      heightRef.value,
      padding,
    );
    svgRef.value
      .transition()
      .duration(500)
      .call(zoomRef.value.transform, zoomIdentity.translate(translateX, translateY).scale(scale));
  }

  function zoomIn() {
    if (!svgRef.value || !zoomRef.value) return;
    svgRef.value.transition().duration(300).call(zoomRef.value.scaleBy, 1.3);
  }

  function zoomOut() {
    if (!svgRef.value || !zoomRef.value) return;
    svgRef.value.transition().duration(300).call(zoomRef.value.scaleBy, 0.7);
  }

  // Middle mouse button panning
  function handleMiddleMouseDown(event: MouseEvent) {
    if (event.button === 1) {
      event.preventDefault();
      isMiddleMousePanning.value = true;
      panStartPos.value = { x: event.clientX, y: event.clientY };
      container.value?.style.setProperty("cursor", "grabbing");
    }
  }

  function handleMiddleMouseMove(event: MouseEvent) {
    if (!isMiddleMousePanning.value || !svgRef.value || !zoomRef.value) return;

    const dx = event.clientX - panStartPos.value.x;
    const dy = event.clientY - panStartPos.value.y;
    panStartPos.value = { x: event.clientX, y: event.clientY };

    const svgNode = svgRef.value.node();
    if (!svgNode) return;

    const currentTransform = zoomTransform(svgNode);
    const newTransform = currentTransform.translate(dx / currentTransform.k, dy / currentTransform.k);
    svgRef.value.call(zoomRef.value.transform, newTransform);
  }

  function handleMiddleMouseUp(event: MouseEvent) {
    if (event.button === 1 && isMiddleMousePanning.value) {
      isMiddleMousePanning.value = false;
      container.value?.style.setProperty("cursor", "");
    }
  }

  function handleAuxClick(event: MouseEvent) {
    if (event.button === 1) event.preventDefault();
  }

  // Breathing animation
  function startBreathing() {
    stopBreathing();
    if (!effectiveBreathing.value) return;
    breathingIntervalRef.value = setInterval(() => {
      if (!isDragging.value && !hoveredId.value && simulationRef.value) {
        simulationRef.value.alpha(0.02).restart();
      }
    }, effectiveBreathingInterval.value);
  }

  function stopBreathing() {
    if (!breathingIntervalRef.value) return;
    clearInterval(breathingIntervalRef.value);
    breathingIntervalRef.value = null;
  }

  function attachPanListeners() {
    container.value?.addEventListener("mousedown", handleMiddleMouseDown);
    window.addEventListener("mousemove", handleMiddleMouseMove);
    window.addEventListener("mouseup", handleMiddleMouseUp);
    container.value?.addEventListener("auxclick", handleAuxClick);
  }

  function detachPanListeners() {
    container.value?.removeEventListener("mousedown", handleMiddleMouseDown);
    window.removeEventListener("mousemove", handleMiddleMouseMove);
    window.removeEventListener("mouseup", handleMiddleMouseUp);
    container.value?.removeEventListener("auxclick", handleAuxClick);
  }

  return {
    zoomToFit,
    zoomIn,
    zoomOut,
    startBreathing,
    stopBreathing,
    attachPanListeners,
    detachPanListeners,
  };
}
