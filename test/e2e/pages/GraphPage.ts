import type { Locator, Page } from '@playwright/test'

export class GraphPage {
  readonly page: Page
  readonly heading: Locator
  readonly nodeCount: Locator
  readonly connectionCount: Locator
  readonly filterPanel: Locator
  readonly filterToggle: Locator
  readonly zoomControls: Locator
  readonly fitAllButton: Locator
  readonly zoomInButton: Locator
  readonly zoomOutButton: Locator
  readonly zoomPercent: Locator
  readonly backLink: Locator
  readonly nodePanel: Locator
  readonly canvas: Locator
  readonly loadingSpinner: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByText('Knowledge Graph')
    this.nodeCount = page.getByText(/\d+ nodes/)
    this.connectionCount = page.getByText(/\d+ connections/)
    this.filterPanel = page.getByText('Filters').locator('..')
    this.filterToggle = page.getByText('Filters')
    this.zoomControls = page.locator('.glass-panel').filter({ has: page.getByRole('button', { name: /zoom/i }) })
    this.fitAllButton = page.getByRole('button', { name: /fit all/i })
    this.zoomInButton = page.getByRole('button', { name: /zoom in/i })
    this.zoomOutButton = page.getByRole('button', { name: /zoom out/i })
    this.zoomPercent = page.getByText(/%$/)
    this.backLink = page.locator('a[href="/"]')
    this.nodePanel = page.locator('.glass-panel').filter({ hasText: /outgoing|backlinks/i })
    this.canvas = page.locator('canvas, svg').first()
    this.loadingSpinner = page.locator('.animate-spin')
  }

  async goto() {
    await this.page.goto('/graph', { waitUntil: 'networkidle' })
  }

  async waitForGraphLoad() {
    // Wait for node count to appear (indicates graph has loaded)
    await this.nodeCount.waitFor({ state: 'visible', timeout: 30000 })
  }

  async openFilters() {
    await this.filterToggle.click()
  }

  async zoomIn() {
    await this.zoomInButton.click()
  }

  async zoomOut() {
    await this.zoomOutButton.click()
  }

  async fitAll() {
    await this.fitAllButton.click()
  }

  async getZoomPercent(): Promise<number> {
    const text = await this.zoomPercent.textContent()
    return Number.parseInt(text?.replace('%', '') || '100', 10)
  }

  async goBack() {
    await this.backLink.click()
  }
}
