<script setup lang="ts">
import type { ContentType } from '~~/content.config'
import * as d3 from 'd3'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
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
}>()

const container = ref<HTMLDivElement>()
const hoveredId = ref<string | null>(null)

// Type-specific colors with glow
const typeColors: Record<string, { fill: string, glow: string }> = {
  book: { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }, // Amber
  podcast: { fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' }, // Violet
  article: { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' }, // Cyan
  note: { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' }, // Emerald
  youtube: { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' }, // Red
  course: { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' }, // Pink
  quote: { fill: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' }, // Orange
  movie: { fill: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' }, // Indigo
  tv: { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' }, // Purple
  tweet: { fill: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.5)' }, // Sky
  evergreen: { fill: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' }, // Green
  default: { fill: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' }, // Slate
}

const colors = {
  selected: '#ffffff', // White ring for selected
  connectedEdge: '#94a3b8', // Brighter edge for connections
  edge: '#334155', // Subtle default edge
  text: 'currentColor',
}

const defaultColor = { fill: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' }

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

// Apply highlight styling based on active node (hovered or selected)
function applyHighlight(activeId: string | null) {
  if (!container.value || !props.graphData)
    return

  const connectedIds = getConnectedIds(activeId)

  // Update node circles
  d3.select(container.value)
    .selectAll<SVGCircleElement, GraphNode>('.node-circle')
    .transition()
    .duration(150)
    .attr('opacity', (d) => {
      if (!activeId)
        return 1
      if (d.id === activeId || connectedIds.has(d.id))
        return 1
      return 0.2
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
    .duration(150)
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

  // Update node labels
  d3.select(container.value)
    .selectAll<SVGTextElement, GraphNode>('.node-label')
    .transition()
    .duration(150)
    .attr('opacity', (d) => {
      if (!activeId)
        return 1
      if (d.id === activeId || connectedIds.has(d.id))
        return 1
      return 0.15
    })
}

function initGraph() {
  if (!container.value || !props.graphData)
    return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // Clear existing SVG
  d3.select(container.value).select('svg').remove()

  // Deep clone nodes and edges to avoid D3 mutating the original data
  const nodes: Array<GraphNode> = props.graphData.nodes.map(n => ({ ...n }))
  const edges: Array<GraphEdge> = props.graphData.edges.map(e => ({ ...e }))

  // Create radius scale based on connection count (sqrt for perceptually accurate area-based sizing)
  const maxConnections = Math.max(1, ...nodes.map(n => n.connections ?? 0))
  const radiusScale = d3.scaleSqrt()
    .domain([0, maxConnections])
    .range([6, 20])

  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

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
      .attr('stdDeviation', '4')
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
    })

  svg.call(zoom)

  // Create simulation
  const simulation = d3.forceSimulation<GraphNode>(nodes)
    .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
      .id(d => d.id)
      .distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide<GraphNode>().radius(d => radiusScale(d.connections ?? 0) + 4))

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
    .on('mouseenter', (_, d) => {
      hoveredId.value = d.id
      // Only apply hover highlight if nothing is selected
      if (!props.selectedId) {
        applyHighlight(d.id)
      }
    })
    .on('mouseleave', () => {
      hoveredId.value = null
      // Reset to selected state or default
      applyHighlight(props.selectedId ?? null)
    })

  // Node circles (radius based on connection count, color based on type)
  node.append('circle')
    .attr('r', d => radiusScale(d.connections ?? 0))
    .attr('fill', d => getNodeColor(d.type).fill)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 0)
    .attr('filter', d => getGlowFilter(d.type))
    .attr('class', 'node-circle')

  // Node labels (x offset based on node radius)
  node.append('text')
    .text(d => d.title)
    .attr('x', d => radiusScale(d.connections ?? 0) + 4)
    .attr('y', 4)
    .attr('font-size', '11px')
    .attr('fill', colors.text)
    .attr('class', 'node-label')

  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as GraphNode).x ?? 0)
      .attr('y1', d => (d.source as GraphNode).y ?? 0)
      .attr('x2', d => (d.target as GraphNode).x ?? 0)
      .attr('y2', d => (d.target as GraphNode).y ?? 0)

    node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
  })

  // Apply initial state if there's a selection
  if (props.selectedId) {
    setTimeout(() => applyHighlight(props.selectedId ?? null), 100)
  }

  function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
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
    if (!event.active)
      simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}

onMounted(() => {
  initGraph()
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
</script>

<template>
  <div
    ref="container"
    class="w-full h-[calc(100vh-12rem)] rounded-lg"
  />
</template>
