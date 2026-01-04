import type { Locator, Page } from '@playwright/test'

export class NewsletterDetailPage {
  readonly page: Page
  readonly heading: Locator
  readonly description: Locator
  readonly authorLinks: Locator
  readonly articlesSection: Locator
  readonly articleCount: Locator
  readonly articleList: Locator
  readonly websiteButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1').first()
    this.description = page.locator('p').first()
    this.authorLinks = page.locator('a[href^="/authors/"]')
    this.articlesSection = page.getByRole('heading', { name: 'Articles', level: 2 })
    this.articleCount = page.locator('text=/Articles.*\\(\\d+\\)/')
    this.articleList = page.locator('article')
    this.websiteButton = page.getByRole('link', { name: /View Website/i })
  }

  async goto(slug: string) {
    await this.page.goto(`/newsletters/${slug}`, { waitUntil: 'networkidle' })
  }
}
