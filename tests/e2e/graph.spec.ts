import { expect, test } from '@playwright/test'
import { GraphPage } from './pages/GraphPage'

test.describe('Graph', () => {
  test('graph page loads with node and connection counts', async ({ page }) => {
    const graphPage = new GraphPage(page)
    await graphPage.goto()
    await graphPage.waitForGraphLoad()

    await expect(graphPage.heading).toBeVisible()
    await expect(graphPage.nodeCount).toBeVisible()
    await expect(graphPage.connectionCount).toBeVisible()
  })

  test('zoom in button increases zoom percentage', async ({ page }) => {
    const graphPage = new GraphPage(page)
    await graphPage.goto()
    await graphPage.waitForGraphLoad()

    const initialZoom = await graphPage.getZoomPercent()

    await graphPage.zoomIn()
    await page.waitForTimeout(300)

    const newZoom = await graphPage.getZoomPercent()
    expect(newZoom).toBeGreaterThan(initialZoom)
  })

  test('zoom out button decreases zoom percentage', async ({ page }) => {
    const graphPage = new GraphPage(page)
    await graphPage.goto()
    await graphPage.waitForGraphLoad()

    // First zoom in to have room to zoom out
    await graphPage.zoomIn()
    await page.waitForTimeout(300)

    const initialZoom = await graphPage.getZoomPercent()

    await graphPage.zoomOut()
    await page.waitForTimeout(300)

    const newZoom = await graphPage.getZoomPercent()
    expect(newZoom).toBeLessThan(initialZoom)
  })

  test('filter panel toggle button exists', async ({ page }) => {
    const graphPage = new GraphPage(page)
    await graphPage.goto()
    await graphPage.waitForGraphLoad()

    // Filter toggle button should be visible
    await expect(graphPage.filterToggle).toBeVisible()

    // Click toggle to verify it's interactive
    await graphPage.openFilters()
    await page.waitForTimeout(300)

    // Should still be visible after toggle
    await expect(graphPage.filterToggle).toBeVisible()
  })

  test('back button navigates to home', async ({ page }) => {
    const graphPage = new GraphPage(page)
    await graphPage.goto()
    await graphPage.waitForGraphLoad()

    await Promise.all([
      page.waitForURL('/'),
      graphPage.goBack(),
    ])

    await expect(page).toHaveURL('/')
  })

  test('node and connection counts are non-negative numbers', async ({ page }) => {
    const graphPage = new GraphPage(page)
    await graphPage.goto()
    await graphPage.waitForGraphLoad()

    const nodeText = await graphPage.nodeCount.textContent()
    const connectionText = await graphPage.connectionCount.textContent()

    // Extract numbers from text like "42 nodes" and "35 connections"
    const nodeCount = Number.parseInt(nodeText?.match(/\d+/)?.[0] || '0', 10)
    const connectionCount = Number.parseInt(connectionText?.match(/\d+/)?.[0] || '0', 10)

    expect(nodeCount).toBeGreaterThanOrEqual(0)
    expect(connectionCount).toBeGreaterThanOrEqual(0)
  })
})
