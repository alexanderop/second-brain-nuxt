import type { Locator, Page } from '@playwright/test'

export class NewslettersPage {
  readonly page: Page
  readonly heading: Locator
  readonly newsletterCards: Locator
  readonly firstNewsletterCard: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Newsletters', level: 1 })
    this.newsletterCards = page.locator('a[href^="/newsletters/"]')
    this.firstNewsletterCard = this.newsletterCards.first()
    this.emptyMessage = page.getByText('No newsletters with articles found.')
  }

  async goto() {
    await this.page.goto('/newsletters', { waitUntil: 'networkidle' })
  }

  getNewsletterCardByName(name: string): Locator {
    return this.newsletterCards.filter({ hasText: name })
  }
}
