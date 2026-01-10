import type { Locator, Page } from '@playwright/test'

export class TagsPage {
  readonly page: Page
  readonly heading: Locator
  readonly tagLinks: Locator
  readonly firstTagLink: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Tags', level: 1 })
    this.tagLinks = page.locator('a[href^="/tags/"]')
    this.firstTagLink = this.tagLinks.first()
    this.emptyMessage = page.getByText('No tags found.')
  }

  async goto() {
    await this.page.goto('/tags', { waitUntil: 'networkidle' })
  }

  getTagByName(name: string): Locator {
    return this.tagLinks.filter({ hasText: name })
  }

  async getTagCount(): Promise<number> {
    return this.tagLinks.count()
  }
}
