import type { Locator, Page } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly heading: Locator
  readonly contentList: Locator
  readonly contentCards: Locator
  readonly firstContentCard: Locator
  readonly noContentMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Recent Additions', level: 1 })
    this.contentList = page.locator('article').first().locator('..')
    this.contentCards = page.locator('article')
    this.firstContentCard = page.locator('article').first()
    this.noContentMessage = page.getByText('No content found.')
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' })
  }

  async waitForContent() {
    // Wait for either content cards or "no content" message
    // Content database might take time to initialize in dev mode
    await this.page.waitForSelector('article, :text("No content found.")', { timeout: 15000 })
  }

  async clickFirstContentCard() {
    // Click the main link (the one wrapping the card content)
    await this.firstContentCard.getByRole('link').first().click()
  }

  getContentCardByTitle(title: string): Locator {
    return this.page.locator('article').filter({ hasText: title })
  }
}
