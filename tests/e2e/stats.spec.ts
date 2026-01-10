import { expect, test } from '@playwright/test'
import { StatsPage } from './pages/StatsPage'

test.describe('Stats', () => {
  test('stats page loads with overview cards visible', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    await expect(statsPage.heading).toBeVisible()
    await expect(statsPage.totalNotesCard).toBeVisible()
    await expect(statsPage.connectionsCard).toBeVisible()
  })

  test('charts are rendered', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    // Content by Type chart should be visible
    await expect(statsPage.contentByTypeChart).toBeVisible()

    // Top Tags chart should be visible
    await expect(statsPage.topTagsChart).toBeVisible()
  })

  test('hub notes section shows top connected notes', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    await expect(statsPage.hubNotesSection).toBeVisible()

    // Hub notes section should have content (links or empty message)
    const hubLinks = statsPage.hubNotesSection.locator('a')
    const hubLinksCount = await hubLinks.count()

    // If there are hub links, they should be visible
    if (hubLinksCount > 0) {
      await expect(hubLinks.first()).toBeVisible()
    }
  })

  test('orphan notes modal opens when clicking more orphans', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    const moreOrphansCount = await statsPage.moreOrphansButton.count()
    if (moreOrphansCount === 0) {
      // Not enough orphans to show the button
      test.skip()
      return
    }

    await statsPage.openOrphanModal()
    await expect(statsPage.orphanModal).toBeVisible()
    await expect(statsPage.orphanModalTable).toBeVisible()
  })

  test('orphan modal search filters results', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    const moreOrphansCount = await statsPage.moreOrphansButton.count()
    if (moreOrphansCount === 0) {
      test.skip()
      return
    }

    await statsPage.openOrphanModal()

    const initialRowCount = await statsPage.getOrphanTableRows().count()

    // Search for something specific
    await statsPage.searchOrphans('xyz_unlikely_match_123')

    const filteredRowCount = await statsPage.getOrphanTableRows().count()

    // Filtered results should be different (likely fewer or show "no results")
    // The row count might be 1 if showing "no matches" row
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount)
  })

  test('orphan modal pagination works', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    const moreOrphansCount = await statsPage.moreOrphansButton.count()
    if (moreOrphansCount === 0) {
      test.skip()
      return
    }

    await statsPage.openOrphanModal()

    // Check if pagination exists (only if > 10 orphans)
    const paginationCount = await statsPage.orphanModalPagination.count()
    if (paginationCount === 0) {
      // Not enough orphans for pagination
      test.skip()
      return
    }

    // Get first row text before pagination
    const firstRowText = await statsPage.getOrphanTableRows().first().textContent()

    // Click next page
    const nextButton = statsPage.orphanModalPagination.getByRole('button').last()
    await nextButton.click()
    await page.waitForTimeout(300)

    // First row should be different after pagination
    const newFirstRowText = await statsPage.getOrphanTableRows().first().textContent()
    expect(newFirstRowText).not.toBe(firstRowText)
  })

  test('can navigate from orphan to note page', async ({ page }) => {
    const statsPage = new StatsPage(page)
    await statsPage.goto()
    await statsPage.waitForStatsLoad()

    const moreOrphansCount = await statsPage.moreOrphansButton.count()
    if (moreOrphansCount === 0) {
      test.skip()
      return
    }

    await statsPage.openOrphanModal()

    const orphanLink = statsPage.orphanModalTable.locator('tbody a').first()
    const href = await orphanLink.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '**'),
      orphanLink.click(),
    ])

    // Should have navigated away from stats
    expect(page.url()).not.toContain('/stats')
  })
})
