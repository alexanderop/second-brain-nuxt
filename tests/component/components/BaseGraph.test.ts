import { describe, it, expect, beforeEach, assert } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import BaseGraph from '~/components/BaseGraph.vue'
import {
  createNoteGraphData,
  createFullGraphData,
} from '../factories/graphFactory'

/** Type guard that asserts element exists and narrows type */
function assertElement(el: Element | null): asserts el is Element {
  assert(el !== null, 'Element should exist')
}

/** Wait for D3 simulation to settle (nodes stop moving) */
async function waitForSimulation(ms = 1500): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
}

/** Props that disable animations for stable testing */
const stableTestOptions = {
  breathing: false,
  persistZoom: false,
}

describe('BaseGraph', () => {
  beforeEach(async () => {
    // Set viewport for consistent rendering
    await page.viewport(800, 600)
  })

  describe('rendering', () => {
    it('renders graph container when data provided', async () => {
      const { container } = render(BaseGraph, {
        props: {
          noteGraphData: createNoteGraphData(),
          mode: 'radial',
          options: stableTestOptions,
        },
      })

      // Wait for D3 to render the SVG (which has explicit dimensions)
      await waitForSimulation()

      // Check container and SVG exist
      const graph = container.querySelector('[data-testid="graph"]')
      expect(graph).toBeTruthy()

      const graphContainer = container.querySelector('[data-testid="graph-container"]')
      expect(graphContainer).toBeTruthy()

      // SVG should be rendered by D3
      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('shows empty state when no data provided', async () => {
      render(BaseGraph, {
        props: {},
      })

      // Empty state shows "No connections" text
      await expect.element(page.getByTestId('graph-empty')).toBeVisible()
      await expect.element(page.getByText('No connections')).toBeVisible()
    })

    it('renders nodes with data-node-id attribute', async () => {
      const { container } = render(BaseGraph, {
        props: {
          noteGraphData: createNoteGraphData(),
          mode: 'radial',
          options: stableTestOptions,
        },
      })

      // Wait for D3 simulation to settle
      await waitForSimulation()

      // Check for center node
      const centerNode = container.querySelector('[data-node-id="center-note"]')
      expect(centerNode).toBeTruthy()

      // Check for connected nodes
      const connectedNode = container.querySelector('[data-node-id="note-1"]')
      expect(connectedNode).toBeTruthy()
    })

    it('renders hexagon shapes for map nodes in freeform mode', async () => {
      const { container } = render(BaseGraph, {
        props: {
          fullGraphData: createFullGraphData(),
          mode: 'freeform',
          options: { ...stableTestOptions, hexagonMaps: true },
        },
      })

      // Wait for D3 simulation
      await waitForSimulation()

      // Map node (node-3) should have a path element (hexagon)
      const mapNode = container.querySelector('[data-node-id="node-3"]')
      expect(mapNode).toBeTruthy()

      const hexagonPath = mapNode?.querySelector('path')
      expect(hexagonPath).toBeTruthy()
    })
  })

  describe('user interactions', () => {
    it('emits select when clicking node in freeform mode', async () => {
      const { container, emitted } = render(BaseGraph, {
        props: {
          fullGraphData: createFullGraphData(),
          mode: 'freeform',
          options: stableTestOptions,
        },
      })

      // Wait for D3 simulation to fully settle
      await waitForSimulation()

      // Find and click node using native DOM click (more stable for SVG)
      const node = container.querySelector('[data-node-id="node-1"]')
      assertElement(node)

      // Use native click which is more reliable for SVG elements
      node.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      // Check emitted event
      expect(emitted().select).toBeTruthy()
      expect(emitted().select[0][0]).toMatchObject({ id: 'node-1' })
    })

    it('emits navigate when clicking non-center node in radial mode', async () => {
      const { container, emitted } = render(BaseGraph, {
        props: {
          noteGraphData: createNoteGraphData(),
          mode: 'radial',
          options: stableTestOptions,
        },
      })

      // Wait for D3 simulation to fully settle
      await waitForSimulation()

      // Click on a non-center node
      const node = container.querySelector('[data-node-id="note-1"]')
      assertElement(node)

      node.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      // Check emitted event - radial mode emits navigate for non-center nodes
      expect(emitted().navigate).toBeTruthy()
      expect(emitted().navigate[0][0]).toBe('note-1')
    })

    it('emits select when clicking center node in radial mode', async () => {
      const { container, emitted } = render(BaseGraph, {
        props: {
          noteGraphData: createNoteGraphData(),
          mode: 'radial',
          options: stableTestOptions,
        },
      })

      // Wait for D3 simulation to fully settle
      await waitForSimulation()

      // Click on center node
      const centerNode = container.querySelector('[data-node-id="center-note"]')
      assertElement(centerNode)

      centerNode.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      // Center node emits select, not navigate
      expect(emitted().select).toBeTruthy()
      expect(emitted().select[0][0]).toMatchObject({ id: 'center-note' })
    })
  })

  describe('slots', () => {
    it('renders empty slot when no data', async () => {
      render(BaseGraph, {
        props: {},
        slots: {
          empty: '<div data-testid="custom-empty">Custom empty state</div>',
        },
      })

      await expect.element(page.getByTestId('custom-empty')).toBeVisible()
    })

    it('renders header slot with counts', async () => {
      render(BaseGraph, {
        props: {
          noteGraphData: createNoteGraphData(),
          mode: 'radial',
          options: stableTestOptions,
        },
        slots: {
          header: '<template #header="{ nodeCount, edgeCount }"><div data-testid="header">{{ nodeCount }} nodes</div></template>',
        },
      })

      await expect.element(page.getByTestId('graph')).toBeVisible()
    })
  })

  describe('mode differences', () => {
    it('uses radial layout in radial mode', async () => {
      const { container } = render(BaseGraph, {
        props: {
          noteGraphData: createNoteGraphData(),
          mode: 'radial',
          options: stableTestOptions,
        },
      })

      // Wait for D3
      await waitForSimulation()

      // In radial mode, nodes should be positioned around center
      const centerNode = container.querySelector('[data-node-id="center-note"]')
      const otherNode = container.querySelector('[data-node-id="note-1"]')

      expect(centerNode).toBeTruthy()
      expect(otherNode).toBeTruthy()

      // Both should have transform attributes from D3
      expect(centerNode?.getAttribute('transform')).toContain('translate')
      expect(otherNode?.getAttribute('transform')).toContain('translate')
    })

    it('uses freeform layout in freeform mode', async () => {
      const { container } = render(BaseGraph, {
        props: {
          fullGraphData: createFullGraphData(),
          mode: 'freeform',
          options: stableTestOptions,
        },
      })

      // Wait for D3
      await waitForSimulation()

      // Nodes should be positioned
      const nodes = container.querySelectorAll('[data-node-id]')
      expect(nodes.length).toBe(3) // 3 nodes in createFullGraphData
    })
  })
})
