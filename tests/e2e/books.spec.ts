import { expect, test } from '@playwright/test'
import { BooksPage } from './pages/BooksPage'

test.describe('Books', () => {
  test('books page loads with total count', async ({ page }) => {
    const booksPage = new BooksPage(page)
    await booksPage.goto()

    await expect(booksPage.heading).toBeVisible()
    await expect(booksPage.totalCount).toBeVisible()

    const countText = await booksPage.totalCount.textContent()
    expect(countText).toMatch(/\(\d+\)/)
  })

  test('currently reading section displays books with that status', async ({ page }) => {
    const booksPage = new BooksPage(page)
    await booksPage.goto()

    const sectionCount = await booksPage.currentlyReadingSection.count()
    // Section only appears if there are books with "reading" status
    if (sectionCount > 0) {
      await expect(booksPage.currentlyReadingSection).toBeVisible()
    }
  })

  test('want to read section displays books with that status', async ({ page }) => {
    const booksPage = new BooksPage(page)
    await booksPage.goto()

    const sectionCount = await booksPage.wantToReadSection.count()
    // Section only appears if there are books with "want-to-read" status
    if (sectionCount > 0) {
      await expect(booksPage.wantToReadSection).toBeVisible()
    }
  })

  test('books by year sections exist when there are finished books', async ({ page }) => {
    const booksPage = new BooksPage(page)
    await booksPage.goto()

    const yearSections = booksPage.getYearSections()
    const yearSectionCount = await yearSections.count()

    // Year sections only appear if there are finished books
    if (yearSectionCount > 0) {
      // Verify first year section is visible
      await expect(yearSections.first()).toBeVisible()

      // Verify years are 4-digit numbers
      const firstYearText = await yearSections.first().textContent()
      expect(firstYearText).toMatch(/^(19|20)\d{2}$/)
    }
  })

  test('can navigate from book card to book detail page', async ({ page }) => {
    const booksPage = new BooksPage(page)
    await booksPage.goto()

    const bookCount = await booksPage.getBookCount()
    if (bookCount === 0) {
      await expect(booksPage.emptyMessage).toBeVisible()
      test.skip()
      return
    }

    const firstBook = booksPage.contentItems.first()
    const link = firstBook.getByRole('link').first()
    const href = await link.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '**'),
      link.click(),
    ])

    // Should have navigated to a book detail page
    expect(page.url()).not.toContain('/books')
    expect(page.url()).not.toBe('/books')
  })
})
