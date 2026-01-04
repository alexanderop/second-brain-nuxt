import { describe, it, expect, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from 'vitest-browser-vue'
import StatsLineChart from '~/components/StatsLineChart.vue'
import { createLineChartData, createEmptyChartData } from '../factories/chartFactory'

/** Wait for D3 to render the chart */
async function waitForChart(ms = 300): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
}

describe('StatsLineChart', () => {
  beforeEach(async () => {
    await page.viewport(800, 400)
  })

  describe('rendering', () => {
    it('renders SVG when data provided', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(),
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('renders area path', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(),
        },
      })

      await waitForChart()

      // Area path has gradient fill
      const paths = container.querySelectorAll('path')
      const areaPath = Array.from(paths).find(p =>
        p.getAttribute('fill')?.includes('url(#area-gradient)'),
      )
      expect(areaPath).toBeTruthy()
    })

    it('renders line path', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(),
        },
      })

      await waitForChart()

      // Line path has stroke and no fill
      const paths = container.querySelectorAll('path')
      const linePath = Array.from(paths).find(p =>
        p.getAttribute('fill') === 'none' && p.getAttribute('stroke'),
      )
      expect(linePath).toBeTruthy()
      expect(linePath?.getAttribute('stroke')).toBe('#6ee7b7')
    })

    it('renders data points as circles', async () => {
      const data = createLineChartData(6)
      const { container } = render(StatsLineChart, {
        props: { data },
      })

      await waitForChart()

      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBe(6)
    })

    it('does not render SVG when data is empty', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createEmptyChartData(),
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg).toBeFalsy()
    })
  })

  describe('axes', () => {
    it('renders x-axis labels', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(4),
        },
      })

      await waitForChart()

      const xLabels = container.querySelectorAll('text.x-label')
      expect(xLabels.length).toBeGreaterThan(0)
    })

    it('formats date labels correctly', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(3),
        },
      })

      await waitForChart()

      // Labels should be formatted like "Jan 24" from "2024-01"
      const xLabels = container.querySelectorAll('text.x-label')
      const labelTexts = Array.from(xLabels)
        .map(l => l.textContent)
        .filter(Boolean)

      // At least one label should match the format
      const hasFormattedLabel = labelTexts.some(text =>
        /^[A-Z][a-z]{2} \d{2}$/.test(text ?? ''),
      )
      expect(hasFormattedLabel).toBe(true)
    })

    it('renders y-axis labels', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(4),
        },
      })

      await waitForChart()

      const yLabels = container.querySelectorAll('text.y-label')
      expect(yLabels.length).toBeGreaterThan(0)
    })
  })

  describe('grid lines', () => {
    it('renders horizontal grid lines', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(4),
        },
      })

      await waitForChart()

      const gridLines = container.querySelectorAll('line.grid-line')
      expect(gridLines.length).toBeGreaterThan(0)
    })
  })

  describe('custom height', () => {
    it('respects custom height prop', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(3),
          height: 250,
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('height')).toBe('250')
    })

    it('uses default height of 160 when not specified', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(3),
        },
      })

      await waitForChart()

      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('height')).toBe('160')
    })
  })

  describe('gradient', () => {
    it('creates area gradient definition', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(3),
        },
      })

      await waitForChart()

      const gradient = container.querySelector('defs linearGradient#area-gradient')
      expect(gradient).toBeTruthy()

      // Should have two stops for the gradient
      const stops = gradient?.querySelectorAll('stop')
      expect(stops?.length).toBe(2)
    })
  })

  describe('data point styling', () => {
    it('data points have correct fill color', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(3),
        },
      })

      await waitForChart()

      const circles = container.querySelectorAll('circle')
      const firstCircle = circles[0]

      expect(firstCircle?.getAttribute('fill')).toBe('#6ee7b7')
    })

    it('data points have correct radius', async () => {
      const { container } = render(StatsLineChart, {
        props: {
          data: createLineChartData(3),
        },
      })

      await waitForChart()

      const circles = container.querySelectorAll('circle')
      const firstCircle = circles[0]

      expect(firstCircle?.getAttribute('r')).toBe('4')
    })
  })
})
