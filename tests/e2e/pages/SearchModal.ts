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
    // UCommandPalette uses an input with placeholder - use placeholder selector for reliability
    this.searchInput = page.getByPlaceholder(/search/i)
    // UCommandPalette renders results as options in a listbox
    this.results = page.getByRole('option')
    this.firstResult = page.getByRole('option').first()
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
    // Wait for Fuse.js filtering
    await this.page.waitForTimeout(300)
  }

  async selectFirstResult() {
    await this.firstResult.click()
  }

  async close() {
    await this.page.keyboard.press('Escape')
  }
}
