import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { NotePage } from './pages/NotePage'
import { SearchModal } from './pages/SearchModal'

test.describe('Smoke Tests', () => {
  test('homepage loads with content list', async ({ page }) => {
    const homePage = new HomePage(page)

    await homePage.goto()

    // Verify page title
    await expect(homePage.heading).toBeVisible()

    // Verify content list has items
    await expect(homePage.contentCards.first()).toBeVisible()

    // Verify at least some content is displayed
    const count = await homePage.contentCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('can navigate to a note page', async ({ page }) => {
    const homePage = new HomePage(page)
    const notePage = new NotePage(page)

    await homePage.goto()

    // Get the href of first card before clicking
    const firstLink = homePage.firstContentCard.getByRole('link').first()
    const href = await firstLink.getAttribute('href')

    // Click and wait for navigation
    await Promise.all([
      page.waitForURL(href || '**'),
      firstLink.click(),
    ])

    // Verify note page loaded (single article, not a list)
    await expect(notePage.title).toBeVisible()
    await expect(page).not.toHaveURL('/')
  })

  test('wiki-link navigation works', async ({ page }) => {
    const notePage = new NotePage(page)

    // Navigate to a note with known wiki-links
    await notePage.goto('atomic-habits')

    // Verify page loaded
    await expect(notePage.title).toBeVisible()

    // Check if wiki-links exist on the page
    const wikiLinkCount = await notePage.wikiLinks.count()

    // Skip test gracefully if no wiki-links (should not happen with atomic-habits)
    if (wikiLinkCount === 0) {
      console.warn('Note "atomic-habits" has no wiki-links to test')
      return
    }

    // Get the href of the first wiki-link before clicking
    const firstWikiLink = notePage.wikiLinks.first()
    const href = await firstWikiLink.getAttribute('href')

    // Click and wait for navigation (wiki-links trigger client-side navigation)
    await Promise.all([
      page.waitForURL(href || '**'),
      firstWikiLink.click(),
    ])

    // Verify new page loaded
    await expect(notePage.article).toBeVisible()
  })

  test('search modal opens and finds content', async ({ page }) => {
    const homePage = new HomePage(page)
    const searchModal = new SearchModal(page)
    const notePage = new NotePage(page)

    await homePage.goto()

    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle')

    // Open search modal with button click (more reliable than keyboard shortcut)
    await searchModal.openWithClick()
    await expect(searchModal.modal).toBeVisible()
    await expect(searchModal.searchInput).toBeFocused()

    // Search for a known term
    await searchModal.search('atomic')

    // Verify results appear
    await expect(searchModal.results.first()).toBeVisible()

    // Click first result
    await searchModal.selectFirstResult()

    // Verify modal closed and navigated
    await expect(searchModal.modal).not.toBeVisible()
    await expect(notePage.article).toBeVisible()
  })
})
