import type { Locator, Page } from '@playwright/test'

export class AuthorDetailPage {
  readonly page: Page
  readonly heading: Locator
  readonly avatar: Locator
  readonly bio: Locator
  readonly socialLinks: Locator
  readonly notesSection: Locator
  readonly tweetsSection: Locator
  readonly backLink: Locator
  readonly contentItems: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { level: 1 })
    this.avatar = page.locator('img[alt]').first()
    this.bio = page.locator('h1').locator('..').locator('~ div').first()
    this.socialLinks = page.locator('a[target="_blank"]')
    this.notesSection = page.getByRole('heading', { name: /Notes/i }).locator('..')
    this.tweetsSection = page.getByRole('heading', { name: /Tweets/i }).locator('..')
    // The back link is the one with just the arrow icon (no text)
    this.backLink = page.locator('a[href="/authors"]').filter({ hasText: /^$/ }).first()
    this.contentItems = page.locator('article')
  }

  async goto(name: string) {
    await this.page.goto(`/authors/${encodeURIComponent(name)}`, { waitUntil: 'networkidle' })
  }

  getSocialLink(label: string): Locator {
    return this.socialLinks.filter({ hasText: label })
  }
}
