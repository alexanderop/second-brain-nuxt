<script setup lang="ts">
import * as d3 from 'd3'

interface DataPoint {
  label: string
  value: number
}

const props = defineProps<{
  data: DataPoint[]
  height?: number
}>()

const container = ref<HTMLDivElement>()
const chartHeight = computed(() => props.height ?? 160)

function drawChart() {
  if (!container.value || !props.data.length) return

  const width = container.value.clientWidth
  const height = chartHeight.value

  // Clear existing
  d3.select(container.value).select('svg').remove()

  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Scales
  const x = d3.scalePoint()
    .domain(props.data.map(d => d.label))
    .range([0, innerWidth])

  const y = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.value) ?? 0])
    .range([innerHeight, 0])
    .nice()

  // Area gradient
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'area-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#6ee7b7')
    .attr('stop-opacity', 0.3)

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#6ee7b7')
    .attr('stop-opacity', 0)

  // Area
  const area = d3.area<DataPoint>()
    .x(d => x(d.label) ?? 0)
    .y0(innerHeight)
    .y1(d => y(d.value))
    .curve(d3.curveMonotoneX)

  g.append('path')
    .datum(props.data)
    .attr('fill', 'url(#area-gradient)')
    .attr('d', area)

  // Line
  const line = d3.line<DataPoint>()
    .x(d => x(d.label) ?? 0)
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX)

  g.append('path')
    .datum(props.data)
    .attr('fill', 'none')
    .attr('stroke', '#6ee7b7')
    .attr('stroke-width', 2)
    .attr('d', line)

  // Data points
  g.selectAll('circle')
    .data(props.data)
    .join('circle')
    .attr('cx', d => x(d.label) ?? 0)
    .attr('cy', d => y(d.value))
    .attr('r', 4)
    .attr('fill', '#6ee7b7')

  // X-axis labels (show every other label if too many)
  const showEvery = Math.ceil(props.data.length / 8)
  g.selectAll('.x-label')
    .data(props.data)
    .join('text')
    .attr('class', 'x-label')
    .attr('x', d => x(d.label) ?? 0)
    .attr('y', innerHeight + 20)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--ui-text-muted)')
    .attr('font-size', '10px')
    .text((d, i) => i % showEvery === 0 ? formatLabel(d.label) : '')

  // Y-axis (just a few ticks)
  const yTicks = y.ticks(4)
  g.selectAll('.y-label')
    .data(yTicks)
    .join('text')
    .attr('class', 'y-label')
    .attr('x', -8)
    .attr('y', d => y(d))
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'var(--ui-text-muted)')
    .attr('font-size', '10px')
    .text(d => d)

  // Horizontal grid lines
  g.selectAll('.grid-line')
    .data(yTicks)
    .join('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', 'var(--ui-border)')
    .attr('stroke-opacity', 0.5)
}

function formatLabel(label: string): string {
  // Convert "2024-01" to "Jan 24"
  const parts = label.split('-')
  if (parts.length < 2) return label
  const year = parts[0] ?? ''
  const month = parts[1] ?? ''
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = Number.parseInt(month) - 1
  const monthName = monthNames[monthIndex] ?? month
  return `${monthName} ${year.slice(2)}`
}

onMounted(() => drawChart())
watch(() => props.data, () => drawChart(), { deep: true })
useResizeObserver(container, useDebounceFn(drawChart, 200))
</script>

<template>
  <div ref="container" class="w-full" :style="{ height: `${chartHeight}px` }" />
</template>
