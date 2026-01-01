<script setup lang="ts">
import * as d3 from 'd3'

interface DataItem {
  label: string
  value: number
  color?: string
}

const props = defineProps<{
  data: DataItem[]
  horizontal?: boolean
  height?: number
}>()

const container = ref<HTMLDivElement>()
const chartHeight = computed(() => props.height ?? 200)

// Monochrome slate palette - sorted by value, first gets accent
const accentColor = '#6ee7b7' // Soft emerald accent for top item
const slateShades = [
  '#64748b', // slate-500
  '#475569', // slate-600
  '#334155', // slate-700
  '#1e293b', // slate-800
]

// Get color based on index (0 = accent, rest = progressively darker slate)
function getBarColor(index: number): string {
  if (index === 0) return accentColor
  // Distribute remaining items across slate shades
  const shadeIndex = Math.min(index - 1, slateShades.length - 1)
  return slateShades[shadeIndex] ?? slateShades[0] ?? accentColor
}

// Lighten color for gradient start
function lightenColor(color: string, amount: number = 0.15): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = Number.parseInt(color.slice(1), 16)
    const r = Math.min(255, ((num >> 16) & 0xFF) + Math.round(255 * amount))
    const g = Math.min(255, ((num >> 8) & 0xFF) + Math.round(255 * amount))
    const b = Math.min(255, (num & 0xFF) + Math.round(255 * amount))
    return `rgb(${r}, ${g}, ${b})`
  }
  return color
}

function drawChart() {
  if (!container.value || !props.data.length) return

  const width = container.value.clientWidth
  const height = chartHeight.value

  // Clear existing
  d3.select(container.value).select('svg').remove()

  const margin = props.horizontal
    ? { top: 10, right: 40, bottom: 10, left: 80 }
    : { top: 10, right: 10, bottom: 40, left: 40 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // Create defs for gradients
  const defs = svg.append('defs')

  // Create a gradient for each data item (monochrome based on index)
  props.data.forEach((d, i) => {
    const color = d.color ?? getBarColor(i)
    const gradient = defs.append('linearGradient')
      .attr('id', `bar-gradient-${i}`)
      .attr('x1', props.horizontal ? '0%' : '0%')
      .attr('y1', props.horizontal ? '0%' : '100%')
      .attr('x2', props.horizontal ? '100%' : '0%')
      .attr('y2', props.horizontal ? '0%' : '0%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', lightenColor(color, 0.12))

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
  })

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  if (props.horizontal) {
    // Horizontal bar chart
    const y = d3.scaleBand()
      .domain(props.data.map(d => d.label))
      .range([0, innerHeight])
      .padding(0.3)

    const x = d3.scaleLinear()
      .domain([0, d3.max(props.data, d => d.value) ?? 0])
      .range([0, innerWidth])

    // Faint grid lines
    const xTicks = x.ticks(4)
    g.selectAll('.grid-line')
      .data(xTicks)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', d => x(d))
      .attr('x2', d => x(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'var(--ui-border)')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '2,2')

    // Bars with gradient fill
    g.selectAll('rect')
      .data(props.data)
      .join('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.label) ?? 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.value))
      .attr('fill', (_, i) => `url(#bar-gradient-${i})`)
      .attr('rx', 4)
      .style('transition', 'opacity 150ms ease-out')
      .on('mouseenter', function () {
        d3.select(this).attr('opacity', 0.85)
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1)
      })

    // Labels (left side)
    g.selectAll('.label')
      .data(props.data)
      .join('text')
      .attr('class', 'label')
      .attr('y', d => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr('x', -8)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'currentColor')
      .attr('font-size', '12px')
      .text(d => d.label)

    // Values (right side of bars) with mono font
    g.selectAll('.value')
      .data(props.data)
      .join('text')
      .attr('class', 'value')
      .attr('y', d => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr('x', d => x(d.value) + 8)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--ui-text-muted)')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-mono), ui-monospace, monospace')
      .text(d => d.value)
    return
  }
  // Vertical bar chart
  const x = d3.scaleBand()
    .domain(props.data.map(d => d.label))
    .range([0, innerWidth])
    .padding(0.3)

  const y = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.value) ?? 0])
    .range([innerHeight, 0])

  // Faint grid lines
  const yTicks = y.ticks(4)
  g.selectAll('.grid-line')
    .data(yTicks)
    .join('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', 'var(--ui-border)')
    .attr('stroke-opacity', 0.3)
    .attr('stroke-dasharray', '2,2')

  // Bars with gradient fill
  g.selectAll('rect')
    .data(props.data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.label) ?? 0)
    .attr('y', d => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => innerHeight - y(d.value))
    .attr('fill', (_, i) => `url(#bar-gradient-${i})`)
    .attr('rx', 4)
    .style('transition', 'opacity 150ms ease-out')
    .on('mouseenter', function () {
      d3.select(this).attr('opacity', 0.85)
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 1)
    })

  // X-axis labels
  g.selectAll('.label')
    .data(props.data)
    .join('text')
    .attr('class', 'label')
    .attr('x', d => (x(d.label) ?? 0) + x.bandwidth() / 2)
    .attr('y', innerHeight + 16)
    .attr('text-anchor', 'middle')
    .attr('fill', 'currentColor')
    .attr('font-size', '11px')
    .text(d => d.label)

  // Values on top of bars with mono font
  g.selectAll('.value')
    .data(props.data)
    .join('text')
    .attr('class', 'value')
    .attr('x', d => (x(d.label) ?? 0) + x.bandwidth() / 2)
    .attr('y', d => y(d.value) - 6)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--ui-text-muted)')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-mono), ui-monospace, monospace')
    .text(d => d.value)
}

onMounted(() => drawChart())
watch(() => props.data, () => drawChart(), { deep: true })
useResizeObserver(container, useDebounceFn(drawChart, 200))
</script>

<template>
  <div ref="container" class="w-full" :style="{ height: `${chartHeight}px` }" />
</template>
