import { expect, test } from '@playwright/test'
import { AuthorsPage } from './pages/AuthorsPage'
import { AuthorDetailPage } from './pages/AuthorDetailPage'

test.describe('Authors', () => {
  test('authors index page loads with author chips', async ({ page }) => {
    const authorsPage = new AuthorsPage(page)
    await authorsPage.goto()

    await expect(authorsPage.heading).toBeVisible()

    const authorCount = await authorsPage.getAuthorCount()
    if (authorCount === 0) {
      await expect(authorsPage.emptyMessage).toBeVisible()
      return
    }
    expect(authorCount).toBeGreaterThan(0)
    await expect(authorsPage.firstAuthorChip).toBeVisible()
  })

  test('authors display content count badges', async ({ page }) => {
    const authorsPage = new AuthorsPage(page)
    await authorsPage.goto()

    const authorCount = await authorsPage.getAuthorCount()
    if (authorCount === 0) {
      test.skip()
      return
    }

    // Each author chip should have a count badge
    const firstAuthorText = await authorsPage.firstAuthorChip.textContent()
    expect(firstAuthorText).toMatch(/\d+/)
  })

  test('can navigate from author chip to author detail page', async ({ page }) => {
    const authorsPage = new AuthorsPage(page)
    await authorsPage.goto()

    const authorCount = await authorsPage.getAuthorCount()
    if (authorCount === 0) {
      test.skip()
      return
    }

    const href = await authorsPage.firstAuthorChip.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/authors/**'),
      authorsPage.firstAuthorChip.click(),
    ])

    await expect(page).toHaveURL(/\/authors\//)
  })

  test('author detail page shows notes section if author has notes', async ({ page }) => {
    const authorsPage = new AuthorsPage(page)
    await authorsPage.goto()

    const authorCount = await authorsPage.getAuthorCount()
    if (authorCount === 0) {
      test.skip()
      return
    }

    const href = await authorsPage.firstAuthorChip.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/authors/**'),
      authorsPage.firstAuthorChip.click(),
    ])

    const authorDetailPage = new AuthorDetailPage(page)

    // Heading should be visible
    await expect(authorDetailPage.heading).toBeVisible()

    // Check if notes section exists (author might not have notes)
    const notesSectionCount = await authorDetailPage.notesSection.count()
    if (notesSectionCount > 0) {
      await expect(authorDetailPage.notesSection).toBeVisible()
    }
  })

  test('author detail page shows social links when available', async ({ page }) => {
    const authorsPage = new AuthorsPage(page)
    await authorsPage.goto()

    const authorCount = await authorsPage.getAuthorCount()
    if (authorCount === 0) {
      test.skip()
      return
    }

    const href = await authorsPage.firstAuthorChip.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/authors/**'),
      authorsPage.firstAuthorChip.click(),
    ])

    const authorDetailPage = new AuthorDetailPage(page)

    // Social links are optional - just check they work if present
    const socialLinkCount = await authorDetailPage.socialLinks.count()
    if (socialLinkCount > 0) {
      const firstLink = authorDetailPage.socialLinks.first()
      const linkHref = await firstLink.getAttribute('href')
      expect(linkHref).toMatch(/^https?:\/\//)
    }
  })

  test('can navigate back to authors index', async ({ page }) => {
    const authorsPage = new AuthorsPage(page)
    await authorsPage.goto()

    const authorCount = await authorsPage.getAuthorCount()
    if (authorCount === 0) {
      test.skip()
      return
    }

    const href = await authorsPage.firstAuthorChip.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/authors/**'),
      authorsPage.firstAuthorChip.click(),
    ])

    const authorDetailPage = new AuthorDetailPage(page)

    await Promise.all([
      page.waitForURL('/authors'),
      authorDetailPage.backLink.click(),
    ])

    await expect(page).toHaveURL('/authors')
  })
})
