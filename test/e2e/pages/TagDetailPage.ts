import type { Locator, Page } from '@playwright/test'

export class TagDetailPage {
  readonly page: Page
  readonly heading: Locator
  readonly itemCount: Locator
  readonly contentList: Locator
  readonly contentItems: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { level: 1 })
    this.itemCount = page.locator('h1 + span, h1 ~ span').first()
    this.contentList = page.locator('article').first().locator('..')
    this.contentItems = page.locator('article')
  }

  async goto(tag: string) {
    await this.page.goto(`/tags/${tag}`, { waitUntil: 'networkidle' })
  }

  async getContentCount(): Promise<number> {
    return this.contentItems.count()
  }
}
