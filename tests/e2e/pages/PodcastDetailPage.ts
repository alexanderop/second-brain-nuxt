import type { Locator, Page } from '@playwright/test'

export class PodcastDetailPage {
  readonly page: Page
  readonly heading: Locator
  readonly description: Locator
  readonly episodesSection: Locator
  readonly episodeCount: Locator
  readonly relatedSection: Locator
  readonly contentItems: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { level: 1 })
    this.description = page.locator('h1').locator('..').locator('p').first()
    this.episodesSection = page.getByRole('heading', { name: /Episodes/i }).locator('..')
    this.episodeCount = page.getByRole('heading', { name: /Episodes/i }).locator('~ span')
    this.relatedSection = page.getByRole('heading', { name: /Related/i }).locator('..')
    this.contentItems = page.locator('article')
  }

  async goto(slug: string) {
    await this.page.goto(`/podcasts/${slug}`, { waitUntil: 'networkidle' })
  }

  async getEpisodeCount(): Promise<number> {
    return this.contentItems.count()
  }
}
