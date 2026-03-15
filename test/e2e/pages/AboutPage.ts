import type { Locator, Page } from '@playwright/test'

export class AboutPage {
  readonly page: Page
  readonly heading: Locator
  readonly avatar: Locator
  readonly description: Locator
  readonly socialLinks: Locator
  readonly content: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { level: 1 })
    this.avatar = page.locator('img[alt]').first()
    this.description = page.locator('h1 + p, h1 ~ p').first()
    this.socialLinks = page.locator('a[target="_blank"]')
    this.content = page.locator('.prose')
  }

  async goto() {
    await this.page.goto('/about', { waitUntil: 'networkidle' })
  }

  getSocialLink(label: string): Locator {
    return this.socialLinks.filter({ hasText: label })
  }
}
