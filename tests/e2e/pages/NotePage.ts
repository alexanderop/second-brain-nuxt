import type { Locator, Page } from '@playwright/test'

export class NotePage {
  readonly page: Page
  readonly article: Locator
  readonly title: Locator
  readonly summary: Locator
  readonly prose: Locator
  readonly wikiLinks: Locator
  readonly backlinksSection: Locator
  readonly authorPickerModal: Locator

  constructor(page: Page) {
    this.page = page
    this.article = page.locator('article')
    this.title = page.locator('article').getByRole('heading', { level: 1 })
    this.summary = page.locator('article .italic').first()
    this.prose = page.locator('.prose')
    this.wikiLinks = page.locator('a.wiki-link')
    this.backlinksSection = page.locator('text=Backlinks').first()
    this.authorPickerModal = page.getByRole('dialog').filter({ hasText: /author/i })
  }

  async goto(slug: string) {
    await this.page.goto(`/${slug}`, { waitUntil: 'networkidle' })
  }

  async clickFirstWikiLink() {
    await this.wikiLinks.first().click()
  }

  getWikiLinkByText(text: string): Locator {
    return this.page.locator('a.wiki-link').filter({ hasText: text })
  }

  async pressAuthorShortcut() {
    await this.page.keyboard.press('a')
  }
}
