import type { Locator, Page } from '@playwright/test'

export class TablePage {
  readonly page: Page
  readonly heading: Locator
  readonly itemCount: Locator
  readonly tableRows: Locator
  readonly firstTableRow: Locator
  readonly typeHeaderButton: Locator
  readonly typeFilterDropdown: Locator
  readonly loadingIndicator: Locator
  readonly emptyState: Locator
  readonly activeFilterChips: Locator
  readonly clearAllFiltersButton: Locator
  readonly paginationInfo: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Table', level: 1 })
    this.itemCount = page.locator('h1 + span') // Count shown next to heading
    this.tableRows = page.locator('table tbody tr')
    this.firstTableRow = this.tableRows.first()
    this.typeHeaderButton = page.getByRole('button', { name: 'Type' })
    this.typeFilterDropdown = page.getByRole('menu')
    this.loadingIndicator = page.locator('[data-loading="true"]')
    this.emptyState = page.getByText('No content matches your filters')
    this.activeFilterChips = page.locator('.cursor-pointer').filter({ has: page.locator('svg') })
    this.clearAllFiltersButton = page.getByRole('button', { name: 'Clear all' })
    this.paginationInfo = page.getByText(/Showing \d+-\d+ of \d+ items/)
  }

  async goto() {
    await this.page.goto('/table', { waitUntil: 'networkidle' })
  }

  async gotoWithTypeFilter(type: string) {
    await this.page.goto(`/table?type=${type}`, { waitUntil: 'networkidle' })
  }

  async waitForTableLoad() {
    // Wait for loading to finish and at least one row to appear
    await this.page.waitForLoadState('networkidle')
    await this.firstTableRow.waitFor({ state: 'visible', timeout: 10000 })
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count()
  }

  async clickFirstRow() {
    await this.firstTableRow.click()
  }

  async openTypeFilter() {
    await this.typeHeaderButton.click()
    await this.typeFilterDropdown.waitFor({ state: 'visible' })
  }

  async selectTypeFilter(type: string) {
    await this.openTypeFilter()
    await this.page.getByRole('menuitemcheckbox', { name: type }).click()
    // Close dropdown by clicking elsewhere
    await this.heading.click()
  }

  getTypeBadge(type: string): Locator {
    return this.page.locator('table').getByText(type, { exact: true })
  }

  async getFirstRowText(): Promise<string> {
    return this.firstTableRow.innerText()
  }

  async goToNextPage() {
    await this.page.getByRole('button', { name: 'Next Page' }).click()
    await this.waitForTableLoad()
  }
}
