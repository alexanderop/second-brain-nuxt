import type { Locator, Page } from '@playwright/test'

export class AuthorsPage {
  readonly page: Page
  readonly heading: Locator
  readonly authorChips: Locator
  readonly firstAuthorChip: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Authors', level: 1 })
    this.authorChips = page.locator('a[href^="/authors/"]')
    this.firstAuthorChip = this.authorChips.first()
    this.emptyMessage = page.getByText('No authors found.')
  }

  async goto() {
    await this.page.goto('/authors', { waitUntil: 'networkidle' })
  }

  getAuthorByName(name: string): Locator {
    return this.authorChips.filter({ hasText: name })
  }

  async getAuthorCount(): Promise<number> {
    return this.authorChips.count()
  }
}
