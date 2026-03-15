import type { Locator, Page } from '@playwright/test'

export class MoviesPage {
  readonly page: Page
  readonly heading: Locator
  readonly totalCount: Locator
  readonly currentlyWatchingSection: Locator
  readonly wantToWatchSection: Locator
  readonly untrackedSection: Locator
  readonly contentItems: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Movies', level: 1 })
    this.totalCount = page.locator('h1 + span, h1 ~ span').first()
    this.currentlyWatchingSection = page.getByRole('heading', { name: 'Currently Watching' }).locator('..')
    this.wantToWatchSection = page.getByRole('heading', { name: 'Want to Watch' }).locator('..')
    this.untrackedSection = page.getByRole('heading', { name: 'Untracked' }).locator('..')
    this.contentItems = page.locator('article')
    this.emptyMessage = page.getByText('No movies found.')
  }

  async goto() {
    await this.page.goto('/movies', { waitUntil: 'networkidle' })
  }

  getSectionByTitle(title: string): Locator {
    return this.page.getByRole('heading', { name: title }).locator('..')
  }

  async getMovieCount(): Promise<number> {
    return this.contentItems.count()
  }

  getYearSections(): Locator {
    // Year sections have h2 headings with 4-digit years
    return this.page.locator('h2').filter({ hasText: /^(19|20)\d{2}$/ })
  }
}
