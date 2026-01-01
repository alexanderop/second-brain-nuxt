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

// Type colors matching the graph
const typeColors: Record<string, string> = {
  book: '#fcd34d',
  podcast: '#c4b5fd',
  article: '#67e8f9',
  note: '#6ee7b7',
  youtube: '#fca5a5',
  course: '#f9a8d4',
  quote: '#fdba74',
  movie: '#a5b4fc',
  tv: '#d8b4fe',
  tweet: '#7dd3fc',
  evergreen: '#86efac',
}

const defaultColor = '#94a3b8'

function getColor(label: string): string {
  return typeColors[label.toLowerCase()] ?? defaultColor
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

    // Bars
    g.selectAll('rect')
      .data(props.data)
      .join('rect')
      .attr('y', d => y(d.label) ?? 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.value))
      .attr('fill', d => d.color ?? getColor(d.label))
      .attr('rx', 4)

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

    // Values (right side of bars)
    g.selectAll('.value')
      .data(props.data)
      .join('text')
      .attr('class', 'value')
      .attr('y', d => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr('x', d => x(d.value) + 6)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--ui-text-muted)')
      .attr('font-size', '11px')
      .text(d => d.value)
  }
  else {
    // Vertical bar chart
    const x = d3.scaleBand()
      .domain(props.data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0, d3.max(props.data, d => d.value) ?? 0])
      .range([innerHeight, 0])

    // Bars
    g.selectAll('rect')
      .data(props.data)
      .join('rect')
      .attr('x', d => x(d.label) ?? 0)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', d => d.color ?? getColor(d.label))
      .attr('rx', 4)

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

    // Values on top of bars
    g.selectAll('.value')
      .data(props.data)
      .join('text')
      .attr('class', 'value')
      .attr('x', d => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--ui-text-muted)')
      .attr('font-size', '11px')
      .text(d => d.value)
  }
}

onMounted(() => drawChart())
watch(() => props.data, () => drawChart(), { deep: true })
useResizeObserver(container, useDebounceFn(drawChart, 200))
</script>

<template>
  <div ref="container" class="w-full" :style="{ height: `${chartHeight}px` }" />
</template>
