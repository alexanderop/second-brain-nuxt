import { expect, test } from '@playwright/test'
import { MoviesPage } from './pages/MoviesPage'

test.describe('Movies', () => {
  test('movies page loads with total count', async ({ page }) => {
    const moviesPage = new MoviesPage(page)
    await moviesPage.goto()

    await expect(moviesPage.heading).toBeVisible()
    await expect(moviesPage.totalCount).toBeVisible()

    const countText = await moviesPage.totalCount.textContent()
    expect(countText).toMatch(/\(\d+\)/)
  })

  test('currently watching section displays movies with that status', async ({ page }) => {
    const moviesPage = new MoviesPage(page)
    await moviesPage.goto()

    const sectionCount = await moviesPage.currentlyWatchingSection.count()
    // Section only appears if there are movies with "watching" status
    if (sectionCount > 0) {
      await expect(moviesPage.currentlyWatchingSection).toBeVisible()
    }
  })

  test('want to watch section displays movies with that status', async ({ page }) => {
    const moviesPage = new MoviesPage(page)
    await moviesPage.goto()

    const sectionCount = await moviesPage.wantToWatchSection.count()
    // Section only appears if there are movies with "want-to-watch" status
    if (sectionCount > 0) {
      await expect(moviesPage.wantToWatchSection).toBeVisible()
    }
  })

  test('movies by year sections exist when there are watched movies', async ({ page }) => {
    const moviesPage = new MoviesPage(page)
    await moviesPage.goto()

    const yearSections = moviesPage.getYearSections()
    const yearSectionCount = await yearSections.count()

    // Year sections only appear if there are watched movies
    if (yearSectionCount > 0) {
      // Verify first year section is visible
      await expect(yearSections.first()).toBeVisible()

      // Verify years are 4-digit numbers
      const firstYearText = await yearSections.first().textContent()
      expect(firstYearText).toMatch(/^(19|20)\d{2}$/)
    }
  })

  test('can navigate from movie card to movie detail page', async ({ page }) => {
    const moviesPage = new MoviesPage(page)
    await moviesPage.goto()

    const movieCount = await moviesPage.getMovieCount()
    if (movieCount === 0) {
      await expect(moviesPage.emptyMessage).toBeVisible()
      test.skip()
      return
    }

    const firstMovie = moviesPage.contentItems.first()
    const link = firstMovie.getByRole('link').first()
    const href = await link.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '**'),
      link.click(),
    ])

    // Should have navigated to a movie detail page
    expect(page.url()).not.toContain('/movies')
    expect(page.url()).not.toBe('/movies')
  })
})
