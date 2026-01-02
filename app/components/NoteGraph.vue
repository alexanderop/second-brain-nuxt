<script setup lang="ts">
import * as d3 from 'd3'
import { typeColors, getNodeColor, graphColors } from '~/utils/graphColors'

interface NoteGraphNode {
  id: string
  title: string
  type: string
  isCenter?: boolean
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface NoteGraphEdge {
  source: string | NoteGraphNode
  target: string | NoteGraphNode
}

interface NoteGraphData {
  center: NoteGraphNode
  connected: NoteGraphNode[]
  edges: NoteGraphEdge[]
}

const props = defineProps<{
  slug: string
  graphData: NoteGraphData | null | undefined
}>()

const emit = defineEmits<{
  navigate: [slug: string]
}>()

const container = ref<HTMLDivElement>()
const hoveredId = ref<string | null>(null)

// Compact force simulation parameters
const LINK_DISTANCE = 70
const CHARGE_STRENGTH = -200
const RADIAL_STRENGTH = 0.4
const RADIAL_RADIUS = 90
const CENTER_RADIUS = 18
const CONNECTED_RADIUS = 10

function getGlowFilter(type: string): string {
  return `url(#glow-${type in typeColors ? type : 'default'})`
}

// Helper: Get x coordinate from edge endpoint (source or target)
function getEdgeX(endpoint: string | NoteGraphNode): number {
  return typeof endpoint === 'string' ? 0 : (endpoint.x ?? 0)
}

// Helper: Get y coordinate from edge endpoint (source or target)
function getEdgeY(endpoint: string | NoteGraphNode): number {
  return typeof endpoint === 'string' ? 0 : (endpoint.y ?? 0)
}

function initGraph() {
  if (!container.value || !props.graphData) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // Clear existing SVG
  d3.select(container.value).select('svg').remove()

  // Build nodes array with center first
  const nodes: NoteGraphNode[] = [
    { ...props.graphData.center, isCenter: true },
    ...props.graphData.connected.map(n => ({ ...n })),
  ]

  // Deep clone edges
  const edges: NoteGraphEdge[] = props.graphData.edges.map(e => ({ ...e }))

  // Create SVG
  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Add glow filter definitions
  const defs = svg.append('defs')
  Object.entries(typeColors).forEach(([type, color]) => {
    const filter = defs.append('filter')
      .attr('id', `glow-${type}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
  })

  const g = svg.append('g')

  // Create zoom behavior (limited for compact view)
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 2])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  // Create simulation with compact parameters
  const simulation = d3.forceSimulation<NoteGraphNode>(nodes)
    .force('link', d3.forceLink<NoteGraphNode, NoteGraphEdge>(edges)
      .id(d => d.id)
      .distance(LINK_DISTANCE))
    .force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('radial', d3.forceRadial<NoteGraphNode>(
      RADIAL_RADIUS,
      width / 2,
      height / 2,
    ).strength(d => d.isCenter ? 0 : RADIAL_STRENGTH))
    .force('collision', d3.forceCollide<NoteGraphNode>()
      .radius(d => (d.isCenter ? CENTER_RADIUS : CONNECTED_RADIUS) + 8))
    .alphaDecay(0.05) // Settle faster

  // Create edges
  const link = g.append('g')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('stroke', graphColors.edge)
    .attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('class', 'graph-edge')

  // Create node groups
  const node = g.append('g')
    .selectAll<SVGGElement, NoteGraphNode>('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')

  // Apply drag behavior (D3 types require separate call for type compatibility)
  const dragBehavior = d3.drag<SVGGElement, NoteGraphNode>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
  node.call(dragBehavior)

  node.on('click', (_, d) => {
      if (!d.isCenter) {
        emit('navigate', d.id)
      }
    })
    .on('mouseenter', function (_, d) {
      hoveredId.value = d.id
      // Scale up hovered node
      d3.select(this).select('.node-shape')
        .transition()
        .duration(100)
        .attr('transform', 'scale(1.2)')
      applyHighlight(d.id)
    })
    .on('mouseleave', function () {
      hoveredId.value = null
      d3.select(this).select('.node-shape')
        .transition()
        .duration(100)
        .attr('transform', 'scale(1)')
      applyHighlight(null)
    })

  // Node circles
  node.append('circle')
    .attr('r', d => d.isCenter ? CENTER_RADIUS : CONNECTED_RADIUS)
    .attr('fill', d => getNodeColor(d.type).fill)
    .attr('fill-opacity', 0.9)
    .attr('stroke', d => d.isCenter ? '#ffffff' : 'transparent')
    .attr('stroke-width', d => d.isCenter ? 2 : 0)
    .attr('filter', d => getGlowFilter(d.type))
    .attr('class', 'node-shape')

  // Node labels
  node.append('text')
    .text(d => d.title)
    .attr('x', d => (d.isCenter ? CENTER_RADIUS : CONNECTED_RADIUS) + 5)
    .attr('y', 4)
    .attr('font-size', d => d.isCenter ? '13px' : '11px')
    .attr('font-weight', d => d.isCenter ? '600' : '400')
    .attr('fill', graphColors.text)
    .attr('stroke', 'var(--ui-bg)')
    .attr('stroke-width', 3)
    .attr('paint-order', 'stroke')
    .attr('stroke-linejoin', 'round')
    .attr('class', 'node-label')
    .attr('opacity', d => d.isCenter ? 1 : 0) // Only show center label by default

  // Apply highlight styling
  function applyHighlight(activeId: string | null) {
    // Update node opacity
    node.selectAll<SVGCircleElement, NoteGraphNode>('.node-shape')
      .transition()
      .duration(100)
      .attr('opacity', (d) => {
        if (!activeId) return 1
        if (d.id === activeId) return 1
        // Check if connected to active node
        const isConnected = edges.some((e) => {
          const sourceId = typeof e.source === 'string' ? e.source : e.source.id
          const targetId = typeof e.target === 'string' ? e.target : e.target.id
          return (sourceId === activeId && targetId === d.id)
            || (targetId === activeId && sourceId === d.id)
        })
        return isConnected ? 1 : 0.3
      })

    // Update labels
    node.selectAll<SVGTextElement, NoteGraphNode>('.node-label')
      .transition()
      .duration(100)
      .attr('opacity', (d) => {
        if (d.isCenter) return 1 // Always show center label
        if (!activeId) return 0 // Hide non-center labels when no hover
        if (d.id === activeId) return 1
        // Show connected labels
        const isConnected = edges.some((e) => {
          const sourceId = typeof e.source === 'string' ? e.source : e.source.id
          const targetId = typeof e.target === 'string' ? e.target : e.target.id
          return (sourceId === activeId && targetId === d.id)
            || (targetId === activeId && sourceId === d.id)
        })
        return isConnected ? 1 : 0
      })

    // Update edges
    link
      .transition()
      .duration(100)
      .attr('stroke', (d) => {
        if (!activeId) return graphColors.edge
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id
        const targetId = typeof d.target === 'string' ? d.target : d.target.id
        if (sourceId === activeId || targetId === activeId) {
          return graphColors.connectedEdge
        }
        return graphColors.edge
      })
      .attr('stroke-opacity', (d) => {
        if (!activeId) return 0.5
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id
        const targetId = typeof d.target === 'string' ? d.target : d.target.id
        if (sourceId === activeId || targetId === activeId) return 0.9
        return 0.15
      })
      .attr('stroke-width', (d) => {
        if (!activeId) return 1.5
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id
        const targetId = typeof d.target === 'string' ? d.target : d.target.id
        if (sourceId === activeId || targetId === activeId) return 2.5
        return 1
      })
  }

  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => getEdgeX(d.source))
      .attr('y1', d => getEdgeY(d.source))
      .attr('x2', d => getEdgeX(d.target))
      .attr('y2', d => getEdgeY(d.target))

    node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
  })

  function dragstarted(event: d3.D3DragEvent<SVGGElement, NoteGraphNode, NoteGraphNode>) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, NoteGraphNode, NoteGraphNode>) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, NoteGraphNode, NoteGraphNode>) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}

onMounted(() => {
  initGraph()
})

// Reinitialize when graphData changes
watch(() => props.graphData, () => {
  initGraph()
}, { deep: true })

// Reinitialize on container resize
useResizeObserver(container, useDebounceFn(initGraph, 200))
</script>

<template>
  <section
    v-if="graphData && graphData.connected.length > 0"
    class="mt-12 pt-8 border-t border-[var(--ui-border)]"
  >
    <h2 class="text-sm font-medium text-[var(--ui-text-muted)] mb-4">
      Connections ({{ graphData.connected.length }})
    </h2>
    <div
      ref="container"
      class="w-full h-[250px] bg-[var(--ui-bg-elevated)] rounded-xl border border-[var(--ui-border)] overflow-hidden"
    />
  </section>
</template>
