import type { Locator, Page } from '@playwright/test'

export class StatsPage {
  readonly page: Page
  readonly heading: Locator
  readonly loadingSpinner: Locator
  readonly overviewCards: Locator
  readonly totalNotesCard: Locator
  readonly connectionsCard: Locator
  readonly orphanNotesCard: Locator
  readonly thisWeekCard: Locator
  readonly contentByTypeChart: Locator
  readonly topTagsChart: Locator
  readonly growthChart: Locator
  readonly hubNotesSection: Locator
  readonly orphanNotesSection: Locator
  readonly orphanModal: Locator
  readonly orphanModalSearch: Locator
  readonly orphanModalTable: Locator
  readonly orphanModalPagination: Locator
  readonly moreOrphansButton: Locator
  readonly qualityMetricsSection: Locator
  readonly topAuthorsSection: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Stats', level: 1 })
    this.loadingSpinner = page.getByText('Loading stats...')
    this.overviewCards = page.locator('.grid').first()
    this.totalNotesCard = page.getByText('Total Notes').locator('..')
    this.connectionsCard = page.getByText('Connections').locator('..')
    this.orphanNotesCard = page.getByText('Orphan Notes').locator('..')
    this.thisWeekCard = page.getByText('This Week').locator('..')
    this.contentByTypeChart = page.getByText('Content by Type').locator('..')
    this.topTagsChart = page.getByText('Top Tags').locator('..')
    this.growthChart = page.getByText('Growth Over Time').locator('..')
    this.hubNotesSection = page.getByRole('heading', { name: /Hub Notes/i }).locator('..')
    this.orphanNotesSection = page.getByRole('heading', { name: /Orphan Notes/i }).first().locator('..')
    this.orphanModal = page.locator('[role="dialog"]')
    this.orphanModalSearch = page.getByPlaceholder(/filter/i)
    this.orphanModalTable = page.locator('[role="dialog"] table')
    this.orphanModalPagination = page.locator('[role="dialog"]').locator('nav')
    this.moreOrphansButton = page.getByText(/more orphans/i)
    this.qualityMetricsSection = page.getByRole('heading', { name: /Quality Metrics/i }).locator('..')
    this.topAuthorsSection = page.getByRole('heading', { name: /Top Authors/i }).locator('..')
  }

  async goto() {
    await this.page.goto('/stats', { waitUntil: 'networkidle' })
  }

  async waitForStatsLoad() {
    // Wait for loading to finish
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 })
  }

  async openOrphanModal() {
    await this.moreOrphansButton.click()
    await this.orphanModal.waitFor({ state: 'visible' })
  }

  async searchOrphans(query: string) {
    await this.orphanModalSearch.fill(query)
    // Wait for filter to apply
    await this.page.waitForTimeout(300)
  }

  async closeOrphanModal() {
    await this.page.keyboard.press('Escape')
    await this.orphanModal.waitFor({ state: 'hidden' })
  }

  getOrphanTableRows(): Locator {
    return this.orphanModalTable.locator('tbody tr')
  }

  getSortHeader(column: 'title' | 'type'): Locator {
    return this.orphanModalTable.locator('th').filter({ hasText: new RegExp(column, 'i') })
  }
}
