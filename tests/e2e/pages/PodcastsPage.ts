import type { Locator, Page } from '@playwright/test'

export class PodcastsPage {
  readonly page: Page
  readonly heading: Locator
  readonly podcastCards: Locator
  readonly firstPodcastCard: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Podcasts', level: 1 })
    this.podcastCards = page.locator('a[href^="/podcasts/"]')
    this.firstPodcastCard = this.podcastCards.first()
    this.emptyMessage = page.getByText('No podcasts with episodes found.')
  }

  async goto() {
    await this.page.goto('/podcasts', { waitUntil: 'networkidle' })
  }

  getPodcastByName(name: string): Locator {
    return this.podcastCards.filter({ hasText: name })
  }

  async getPodcastCount(): Promise<number> {
    return this.podcastCards.count()
  }
}
