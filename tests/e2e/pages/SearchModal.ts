import type { Locator, Page } from '@playwright/test'

export class SearchModal {
  readonly page: Page
  readonly modal: Locator
  readonly searchInput: Locator
  readonly results: Locator
  readonly firstResult: Locator
  readonly noResultsMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.locator('[role="dialog"]')
    this.searchInput = page.getByLabel('Search')
    this.results = page.locator('[data-search-result]')
    this.firstResult = page.locator('[data-search-result]').first()
    this.noResultsMessage = page.getByText('No results found')
  }

  async open() {
    await this.page.keyboard.press('Meta+k')
  }

  async openWithClick() {
    await this.page.getByRole('button', { name: /search/i }).click()
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    // Wait for debounced search (200ms) + some buffer
    await this.page.waitForTimeout(300)
  }

  async selectFirstResult() {
    await this.firstResult.click()
  }

  async close() {
    await this.page.keyboard.press('Escape')
  }
}
