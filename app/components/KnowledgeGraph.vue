<script setup lang="ts">
import type { ContentType } from '~~/content.config'
import * as d3 from 'd3'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
  authors: Array<string>
  summary?: string
  connections?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
}

interface GraphData {
  nodes: Array<GraphNode>
  edges: Array<GraphEdge>
}

const props = defineProps<{
  graphData?: GraphData | null
  selectedId?: string | null
}>()

const emit = defineEmits<{
  select: [node: GraphNode]
  zoomChange: [level: number]
}>()

const container = ref<HTMLDivElement>()
const hoveredId = ref<string | null>(null)
const isDragging = ref(false)
const breathingInterval = ref<ReturnType<typeof setInterval> | null>(null)
const simulationRef = shallowRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)

// Persist zoom transform across navigation using sessionStorage
const ZOOM_STORAGE_KEY = 'graph-zoom-transform'

function saveZoomTransform(transform: d3.ZoomTransform) {
  sessionStorage.setItem(ZOOM_STORAGE_KEY, JSON.stringify({
    k: transform.k,
    x: transform.x,
    y: transform.y,
  }))
}

function loadZoomTransform(): d3.ZoomTransform | null {
  const stored = sessionStorage.getItem(ZOOM_STORAGE_KEY)
  if (!stored) return null
  try {
    const { k, x, y } = JSON.parse(stored)
    return d3.zoomIdentity.translate(x, y).scale(k)
  }
  catch {
    return null
  }
}

// Refs for zoom control (accessible outside initGraph)
const svgRef = shallowRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>()
const zoomRef = shallowRef<d3.ZoomBehavior<SVGSVGElement, unknown>>()
const currentNodes = shallowRef<Array<GraphNode>>([])
const widthRef = ref(0)
const heightRef = ref(0)
const currentZoom = ref(1)

// Determine label visibility based on zoom level and node importance
function shouldShowLabel(
  node: GraphNode,
  zoom: number,
  isHovered: boolean,
  isSelected: boolean,
  isConnectedToActive: boolean,
): boolean {
  // Always show hovered, selected, or connected-to-active nodes
  if (isHovered || isSelected || isConnectedToActive) return true

  const connections = node.connections ?? 0

  // Zoom-based thresholds for progressive label reveal
  if (zoom < 0.5) return connections >= 5 // Only hubs at low zoom
  if (zoom < 1.0) return connections >= 2 // Medium nodes at medium zoom
  return true // All labels at high zoom
}

// Type-specific colors with glow (softer pastel palette for Obsidian-like feel)
const typeColors: Record<string, { fill: string, glow: string }> = {
  book: { fill: '#fcd34d', glow: 'rgba(252, 211, 77, 0.4)' }, // Softer amber
  podcast: { fill: '#c4b5fd', glow: 'rgba(196, 181, 253, 0.4)' }, // Softer violet
  article: { fill: '#67e8f9', glow: 'rgba(103, 232, 249, 0.4)' }, // Softer cyan
  note: { fill: '#6ee7b7', glow: 'rgba(110, 231, 183, 0.4)' }, // Softer emerald
  youtube: { fill: '#fca5a5', glow: 'rgba(252, 165, 165, 0.4)' }, // Softer red
  course: { fill: '#f9a8d4', glow: 'rgba(249, 168, 212, 0.4)' }, // Softer pink
  quote: { fill: '#fdba74', glow: 'rgba(253, 186, 116, 0.4)' }, // Softer orange
  movie: { fill: '#a5b4fc', glow: 'rgba(165, 180, 252, 0.4)' }, // Softer indigo
  tv: { fill: '#d8b4fe', glow: 'rgba(216, 180, 254, 0.4)' }, // Softer purple
  tweet: { fill: '#7dd3fc', glow: 'rgba(125, 211, 252, 0.4)' }, // Softer sky
  evergreen: { fill: '#86efac', glow: 'rgba(134, 239, 172, 0.4)' }, // Softer green
  default: { fill: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' }, // Softer slate
}

const colors = {
  selected: '#ffffff', // White ring for selected
  connectedEdge: 'rgba(255, 255, 255, 0.4)', // Brighter edge for connections
  edge: 'rgba(255, 255, 255, 0.15)', // Subtle white edge (Obsidian-like)
  text: 'currentColor',
}

const defaultColor = { fill: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' }

function getNodeColor(type: string): { fill: string, glow: string } {
  return typeColors[type] ?? defaultColor
}

function getGlowFilter(type: string): string {
  return `url(#glow-${type in typeColors ? type : 'default'})`
}

// Get connected node IDs for a given node
function getConnectedIds(nodeId: string | null): Set<string> {
  const connected = new Set<string>()
  if (!nodeId || !props.graphData)
    return connected

  for (const edge of props.graphData.edges) {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id
    if (sourceId === nodeId)
      connected.add(targetId)
    if (targetId === nodeId)
      connected.add(sourceId)
  }
  return connected
}

// Zoom to fit all nodes in view with padding
function zoomToFit(padding = 60) {
  if (!currentNodes.value.length || !svgRef.value || !zoomRef.value) return

  const xExtent = d3.extent(currentNodes.value, d => d.x) as [number, number]
  const yExtent = d3.extent(currentNodes.value, d => d.y) as [number, number]

  // Handle edge case where all nodes are at same position
  const boundsWidth = (xExtent[1] - xExtent[0]) || 1
  const boundsHeight = (yExtent[1] - yExtent[0]) || 1

  // Calculate scale to fit bounds in viewport (max 1.5x to avoid over-zoom)
  const scale = Math.min(
    (widthRef.value - padding * 2) / boundsWidth,
    (heightRef.value - padding * 2) / boundsHeight,
    1.5,
  )

  // Calculate center of bounds
  const centerX = (xExtent[0] + xExtent[1]) / 2
  const centerY = (yExtent[0] + yExtent[1]) / 2

  // Calculate translation to center the bounds
  const translateX = widthRef.value / 2 - centerX * scale
  const translateY = heightRef.value / 2 - centerY * scale

  // Apply transform with smooth transition
  svgRef.value.transition().duration(500).call(
    zoomRef.value.transform,
    d3.zoomIdentity.translate(translateX, translateY).scale(scale),
  )
}

// Zoom in by 1.3x
function zoomIn() {
  if (!svgRef.value || !zoomRef.value) return
  svgRef.value.transition().duration(300).call(zoomRef.value.scaleBy, 1.3)
}

// Zoom out by 0.7x
function zoomOut() {
  if (!svgRef.value || !zoomRef.value) return
  svgRef.value.transition().duration(300).call(zoomRef.value.scaleBy, 0.7)
}

// Apply highlight styling based on active node (hovered or selected)
function applyHighlight(activeId: string | null) {
  if (!container.value || !props.graphData)
    return

  const connectedIds = getConnectedIds(activeId)

  // Update node circles
  d3.select(container.value)
    .selectAll<SVGCircleElement, GraphNode>('.node-circle')
    .transition()
    .duration(100) // Faster transition for snappier feel
    .attr('opacity', (d) => {
      if (!activeId)
        return 1
      if (d.id === activeId || connectedIds.has(d.id))
        return 1
      return 0.1 // Stronger dimming for Obsidian-like focus effect
    })
    .attr('stroke', (d) => {
      if (d.id === props.selectedId)
        return colors.selected
      return 'transparent'
    })
    .attr('stroke-width', d => d.id === props.selectedId ? 2 : 0)

  // Update edges
  d3.select(container.value)
    .selectAll<SVGLineElement, GraphEdge>('.graph-edge')
    .transition()
    .duration(100) // Faster transition for snappier feel
    .attr('stroke', (d) => {
      if (!activeId)
        return colors.edge
      const sourceId = typeof d.source === 'string' ? d.source : d.source.id
      const targetId = typeof d.target === 'string' ? d.target : d.target.id
      if (sourceId === activeId || targetId === activeId)
        return colors.connectedEdge
      return colors.edge
    })
    .attr('stroke-opacity', (d) => {
      if (!activeId)
        return 0.3
      const sourceId = typeof d.source === 'string' ? d.source : d.source.id
      const targetId = typeof d.target === 'string' ? d.target : d.target.id
      if (sourceId === activeId || targetId === activeId)
        return 0.9
      return 0.08
    })
    .attr('stroke-width', (d) => {
      if (!activeId)
        return 1
      const sourceId = typeof d.source === 'string' ? d.source : d.source.id
      const targetId = typeof d.target === 'string' ? d.target : d.target.id
      if (sourceId === activeId || targetId === activeId)
        return 2
      return 1
    })

  // Update node labels with zoom-aware visibility
  d3.select(container.value)
    .selectAll<SVGTextElement, GraphNode>('.node-label')
    .transition()
    .duration(100) // Faster transition for snappier feel
    .attr('opacity', (d) => {
      const isHovered = d.id === hoveredId.value
      const isSelected = d.id === props.selectedId
      const isConnectedToActive = activeId ? connectedIds.has(d.id) : false
      const isActiveNode = d.id === activeId

      // If there's an active highlight, show active + connected
      if (activeId) {
        if (isActiveNode || isConnectedToActive) return 1
        return 0.1 // Dim non-connected labels
      }

      // No highlight: use zoom-based visibility
      return shouldShowLabel(d, currentZoom.value, isHovered, isSelected, false) ? 1 : 0
    })
}

// Update label visibility based on current zoom (called on zoom change)
function updateLabelVisibility() {
  if (!container.value) return

  const activeId = props.selectedId ?? hoveredId.value
  const connectedIds = getConnectedIds(activeId)

  d3.select(container.value)
    .selectAll<SVGTextElement, GraphNode>('.node-label')
    .attr('opacity', (d) => {
      const isHovered = d.id === hoveredId.value
      const isSelected = d.id === props.selectedId
      const isConnectedToActive = activeId ? connectedIds.has(d.id) : false
      const isActiveNode = d.id === activeId

      // If there's an active highlight, show active + connected
      if (activeId) {
        if (isActiveNode || isConnectedToActive) return 1
        return 0.1
      }

      // No highlight: use zoom-based visibility
      return shouldShowLabel(d, currentZoom.value, isHovered, isSelected, false) ? 1 : 0
    })
}

function initGraph() {
  if (!container.value || !props.graphData)
    return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // Store dimensions in refs for zoom functions
  widthRef.value = width
  heightRef.value = height

  // Clear existing SVG
  d3.select(container.value).select('svg').remove()

  // Deep clone nodes and edges to avoid D3 mutating the original data
  const nodes: Array<GraphNode> = props.graphData.nodes.map(n => ({ ...n }))
  const edges: Array<GraphEdge> = props.graphData.edges.map(e => ({ ...e }))

  // Store nodes ref for zoom-to-fit calculations
  currentNodes.value = nodes

  // Create radius scale based on connection count (power scale for more dramatic size differences)
  const maxConnections = Math.max(1, ...nodes.map(n => n.connections ?? 0))
  const radiusScale = d3.scalePow()
    .exponent(0.7) // Steeper curve than sqrt for more dramatic hub visibility
    .domain([0, maxConnections])
    .range([8, 40]) // Larger range: hubs are 3-5x bigger than orphans

  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Store svg ref for zoom control
  svgRef.value = svg

  // Add glow filter definitions
  const defs = svg.append('defs')

  // Create a glow filter for each type
  Object.entries(typeColors).forEach(([type, color]) => {
    const filter = defs.append('filter')
      .attr('id', `glow-${type}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3') // Subtler glow for softer look
      .attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
  })

  const g = svg.append('g')

  // Create zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
      emit('zoomChange', event.transform.k)
      // Save transform for persistence across navigation
      saveZoomTransform(event.transform)
      // Track zoom level and update label visibility
      currentZoom.value = event.transform.k
      updateLabelVisibility()
    })

  // Store zoom ref for external control
  zoomRef.value = zoom

  svg.call(zoom)

  // Double-click on background to reset view
  svg.on('dblclick.zoom', null) // Disable default d3 double-click zoom
  svg.on('dblclick', () => zoomToFit())

  // Create simulation with tuned physics for organic Obsidian-like feel
  const simulation = d3.forceSimulation<GraphNode>(nodes)
    .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
      .id(d => d.id)
      .distance(150)) // Increased from 100 for more breathing room
    .force('charge', d3.forceManyBody().strength(-500)) // Increased repulsion from -300
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('y', d3.forceY(height / 2).strength(0.02)) // Prevent vertical clustering
    .force('collision', d3.forceCollide<GraphNode>().radius(d => radiusScale(d.connections ?? 0) + 6))

  // Create edges
  const link = g.append('g')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('stroke', colors.edge)
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('class', 'graph-edge')

  // Create nodes
  const node = g.append('g')
    .selectAll<SVGGElement, GraphNode>('g')
    .data(nodes)
    .join('g')
    .attr('data-node-id', d => d.id)
    .attr('cursor', 'pointer')
    .call(d3.drag<SVGGElement, GraphNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as unknown as (selection: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>) => void)
    .on('click', (_, d) => {
      emit('select', d)
    })
    .on('mouseenter', function (_, d) {
      hoveredId.value = d.id
      // Scale up hovered node
      d3.select(this).select('.node-circle')
        .transition()
        .duration(100)
        .attr('transform', 'scale(1.15)')
      // Only apply hover highlight if nothing is selected
      if (!props.selectedId) {
        applyHighlight(d.id)
      }
    })
    .on('mouseleave', function () {
      hoveredId.value = null
      // Scale back down
      d3.select(this).select('.node-circle')
        .transition()
        .duration(100)
        .attr('transform', 'scale(1)')
      // Reset to selected state or default
      applyHighlight(props.selectedId ?? null)
    })

  // Node circles (radius based on connection count, color based on type)
  node.append('circle')
    .attr('r', d => radiusScale(d.connections ?? 0))
    .attr('fill', d => getNodeColor(d.type).fill)
    .attr('fill-opacity', 0.85) // Transparency for depth when overlapping
    .attr('stroke', 'transparent')
    .attr('stroke-width', 0)
    .attr('filter', d => getGlowFilter(d.type))
    .attr('class', 'node-circle')

  // Create font scale for labels (scales with node size for hierarchy)
  const fontScale = d3.scaleLinear()
    .domain([8, 40]) // Match radius scale range
    .range([10, 16]) // Font size range

  // Node labels (x offset based on node radius, font size scales with importance)
  // Uses stroke + paint-order for readable text halo effect
  node.append('text')
    .text(d => d.title)
    .attr('x', d => radiusScale(d.connections ?? 0) + 4)
    .attr('y', 4)
    .attr('font-size', d => `${fontScale(radiusScale(d.connections ?? 0))}px`)
    .attr('fill', colors.text)
    .attr('stroke', 'var(--ui-bg)') // Background color stroke for halo
    .attr('stroke-width', 3)
    .attr('paint-order', 'stroke') // Draw stroke behind fill
    .attr('stroke-linejoin', 'round') // Smooth corners
    .attr('class', 'node-label')
    .attr('opacity', d => shouldShowLabel(d, currentZoom.value, false, false, false) ? 1 : 0)

  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as GraphNode).x ?? 0)
      .attr('y1', d => (d.source as GraphNode).y ?? 0)
      .attr('x2', d => (d.target as GraphNode).x ?? 0)
      .attr('y2', d => (d.target as GraphNode).y ?? 0)

    node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
  })

  // Store simulation reference for breathing animation
  simulationRef.value = simulation

  // When simulation settles: restore saved transform or zoom-to-fit
  simulation.on('end', () => {
    const savedTransform = loadZoomTransform()
    if (savedTransform && svgRef.value && zoomRef.value) {
      // Restore previous zoom/pan state
      svgRef.value.call(zoomRef.value.transform, savedTransform)
      emit('zoomChange', savedTransform.k)
    }
    else {
      // First visit: zoom to fit all nodes
      zoomToFit()
    }
    startBreathing()
  })

  // Apply initial state if there's a selection
  if (props.selectedId) {
    setTimeout(() => applyHighlight(props.selectedId ?? null), 100)
  }

  // Emit initial zoom level
  emit('zoomChange', 1)

  function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    isDragging.value = true
    stopBreathing() // Pause breathing during drag
    if (!event.active)
      simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    isDragging.value = false
    if (!event.active)
      simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
    // Resume breathing after drag settles
    setTimeout(() => startBreathing(), 1000)
  }
}

// Breathing animation: subtle continuous micro-movement when idle
function startBreathing() {
  stopBreathing() // Clear any existing interval
  breathingInterval.value = setInterval(() => {
    if (!isDragging.value && !hoveredId.value && simulationRef.value) {
      simulationRef.value.alpha(0.02).restart()
    }
  }, 3000)
}

function stopBreathing() {
  if (breathingInterval.value) {
    clearInterval(breathingInterval.value)
    breathingInterval.value = null
  }
}

onMounted(() => {
  initGraph()
})

onUnmounted(() => {
  stopBreathing()
})

// Update highlighting when selection changes
watch(() => props.selectedId, (newId) => {
  applyHighlight(newId ?? null)
})

// Reinitialize when graphData changes (filters applied)
watch(() => props.graphData, () => {
  initGraph()
}, { deep: true })

// Reinitialize on container resize (auto-cleanup via VueUse)
useResizeObserver(container, useDebounceFn(initGraph, 200))

// Expose zoom methods for external control
defineExpose({
  fitAll: zoomToFit,
  zoomIn,
  zoomOut,
})
</script>

<template>
  <div
    ref="container"
    class="w-full h-full"
  />
</template>
