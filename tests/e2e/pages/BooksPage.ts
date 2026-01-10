import type { Locator, Page } from '@playwright/test'

export class BooksPage {
  readonly page: Page
  readonly heading: Locator
  readonly totalCount: Locator
  readonly currentlyReadingSection: Locator
  readonly wantToReadSection: Locator
  readonly untrackedSection: Locator
  readonly contentItems: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Books', level: 1 })
    this.totalCount = page.locator('h1 + span, h1 ~ span').first()
    this.currentlyReadingSection = page.getByRole('heading', { name: 'Currently Reading' }).locator('..')
    this.wantToReadSection = page.getByRole('heading', { name: 'Want to Read' }).locator('..')
    this.untrackedSection = page.getByRole('heading', { name: 'Untracked' }).locator('..')
    this.contentItems = page.locator('article')
    this.emptyMessage = page.getByText('No books found.')
  }

  async goto() {
    await this.page.goto('/books', { waitUntil: 'networkidle' })
  }

  getSectionByTitle(title: string): Locator {
    return this.page.getByRole('heading', { name: title }).locator('..')
  }

  async getBookCount(): Promise<number> {
    return this.contentItems.count()
  }

  getYearSections(): Locator {
    // Year sections have h2 headings with 4-digit years
    return this.page.locator('h2').filter({ hasText: /^(19|20)\d{2}$/ })
  }
}
