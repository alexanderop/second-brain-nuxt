import { expect, test } from '@playwright/test'
import { NewslettersPage } from './pages/NewslettersPage'
import { NewsletterDetailPage } from './pages/NewsletterDetailPage'
import { NotePage } from './pages/NotePage'

test.describe('Newsletter Feature', () => {
  test('newsletters index page loads with newsletter cards', async ({ page }) => {
    const newslettersPage = new NewslettersPage(page)

    await newslettersPage.goto()

    // Verify page title/heading
    await expect(newslettersPage.heading).toBeVisible()

    // Verify newsletter cards are displayed
    await expect(newslettersPage.firstNewsletterCard).toBeVisible()

    // Verify at least one newsletter is shown
    const count = await newslettersPage.newsletterCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('can navigate to a newsletter detail page', async ({ page }) => {
    const newslettersPage = new NewslettersPage(page)
    const newsletterDetailPage = new NewsletterDetailPage(page)

    await newslettersPage.goto()

    // Get the href of first newsletter card before clicking
    const firstCard = newslettersPage.firstNewsletterCard
    const href = await firstCard.getAttribute('href')

    // Click and wait for navigation
    await Promise.all([
      page.waitForURL(href || '**/newsletters/**'),
      firstCard.click(),
    ])

    // Verify newsletter detail page loaded
    await expect(newsletterDetailPage.heading).toBeVisible()
    await expect(page).toHaveURL(/\/newsletters\//)
  })

  test('newsletter detail page shows articles section', async ({ page }) => {
    const newsletterDetailPage = new NewsletterDetailPage(page)

    // Navigate to a known newsletter with articles
    await newsletterDetailPage.goto('pragmatic-engineer')

    // Verify heading and articles section
    await expect(newsletterDetailPage.heading).toBeVisible()
    await expect(newsletterDetailPage.heading).toHaveText(/Pragmatic Engineer/i)
    await expect(newsletterDetailPage.articlesSection).toBeVisible()

    // Verify article list has items
    const articleCount = await newsletterDetailPage.articleList.count()
    expect(articleCount).toBeGreaterThan(0)
  })

  test('can navigate from newsletter to article', async ({ page }) => {
    const newsletterDetailPage = new NewsletterDetailPage(page)
    const notePage = new NotePage(page)

    await newsletterDetailPage.goto('pragmatic-engineer')

    // Wait for articles to load
    await expect(newsletterDetailPage.articleList.first()).toBeVisible()

    // Click on the first article
    const firstArticle = newsletterDetailPage.articleList.first()
    const articleLink = firstArticle.getByRole('link').first()
    const href = await articleLink.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '**'),
      articleLink.click(),
    ])

    // Verify article page loaded
    await expect(notePage.article).toBeVisible()
    await expect(notePage.title).toBeVisible()
  })

  test('newsletter shows author links', async ({ page }) => {
    const newsletterDetailPage = new NewsletterDetailPage(page)

    await newsletterDetailPage.goto('pragmatic-engineer')

    // Verify author link is present
    await expect(newsletterDetailPage.authorLinks.first()).toBeVisible()

    // Verify the link points to the correct author
    const authorHref = await newsletterDetailPage.authorLinks.first().getAttribute('href')
    expect(authorHref).toContain('/authors/')
  })
})
