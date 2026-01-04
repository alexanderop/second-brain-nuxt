import { describe, it, expect, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from 'vitest-browser-vue'
import StatsBarChart from '~/components/StatsBarChart.vue'
import {
  createBarChartData,
  createEmptyChartData,
  createSingleItemData,
} from '../factories/chartFactory'

/** Wait for D3 to render the chart */
async function waitForChart(ms = 300): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
}

describe('StatsBarChart', () => {
  beforeEach(async () => {
    await page.viewport(800, 400)
  })

  describe('rendering', () => {
    it('renders SVG when data provided', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createBarChartData(),
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('renders correct number of bars', async () => {
      const data = createBarChartData(4)
      const { container } = render(StatsBarChart, {
        props: { data },
      })

      await waitForChart()

      const bars = container.querySelectorAll('rect.bar')
      expect(bars.length).toBe(4)
    })

    it('renders labels for each bar', async () => {
      const data = createBarChartData(3)
      const { container } = render(StatsBarChart, {
        props: { data },
      })

      await waitForChart()

      const labels = container.querySelectorAll('text.label')
      expect(labels.length).toBe(3)

      // Check label text content
      const labelTexts = Array.from(labels).map(l => l.textContent)
      expect(labelTexts).toContain('Books')
      expect(labelTexts).toContain('Articles')
      expect(labelTexts).toContain('Podcasts')
    })

    it('renders values for each bar', async () => {
      const data = createBarChartData(2)
      const { container } = render(StatsBarChart, {
        props: { data },
      })

      await waitForChart()

      const values = container.querySelectorAll('text.value')
      expect(values.length).toBe(2)

      // Check value text content matches data
      const valueTexts = Array.from(values).map(v => v.textContent)
      expect(valueTexts).toContain('42') // Books value
      expect(valueTexts).toContain('28') // Articles value
    })

    it('does not render SVG when data is empty', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createEmptyChartData(),
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg).toBeFalsy()
    })

    it('renders single bar when only one data item', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createSingleItemData(),
        },
      })

      await waitForChart()

      const bars = container.querySelectorAll('rect.bar')
      expect(bars.length).toBe(1)
    })
  })

  describe('horizontal mode', () => {
    it('renders horizontal bars when horizontal prop is true', async () => {
      const data = createBarChartData(3)
      const { container } = render(StatsBarChart, {
        props: {
          data,
          horizontal: true,
        },
      })

      await waitForChart()

      const bars = container.querySelectorAll('rect.bar')
      expect(bars.length).toBe(3)

      // In horizontal mode, bars should have height from bandwidth
      // and width from scale (varying by value)
      const firstBar = bars[0]
      expect(firstBar).toBeTruthy()
      expect(Number(firstBar?.getAttribute('height'))).toBeGreaterThan(0)
    })

    it('renders vertical bars by default', async () => {
      const data = createBarChartData(3)
      const { container } = render(StatsBarChart, {
        props: { data },
      })

      await waitForChart()

      const bars = container.querySelectorAll('rect.bar')
      expect(bars.length).toBe(3)

      // In vertical mode, bars have width from bandwidth
      const firstBar = bars[0]
      expect(firstBar).toBeTruthy()
      expect(Number(firstBar?.getAttribute('width'))).toBeGreaterThan(0)
    })
  })

  describe('custom height', () => {
    it('respects custom height prop', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createBarChartData(2),
          height: 300,
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('height')).toBe('300')
    })

    it('uses default height of 200 when not specified', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createBarChartData(2),
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('height')).toBe('200')
    })
  })

  describe('gradients', () => {
    it('creates gradient definitions for each bar', async () => {
      const data = createBarChartData(3)
      const { container } = render(StatsBarChart, {
        props: { data },
      })

      await waitForChart()

      const gradients = container.querySelectorAll('defs linearGradient')
      expect(gradients.length).toBe(3)
    })

    it('bars use gradient fills', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createBarChartData(2),
        },
      })

      await waitForChart()

      const bars = container.querySelectorAll('rect.bar')
      const firstBar = bars[0]

      // Bar should reference a gradient
      const fill = firstBar?.getAttribute('fill')
      expect(fill).toMatch(/url\(#bar-gradient-\d+\)/)
    })
  })

  describe('grid lines', () => {
    it('renders grid lines', async () => {
      const { container } = render(StatsBarChart, {
        props: {
          data: createBarChartData(3),
        },
      })

      await waitForChart()

      const gridLines = container.querySelectorAll('line.grid-line')
      expect(gridLines.length).toBeGreaterThan(0)
    })
  })
})
