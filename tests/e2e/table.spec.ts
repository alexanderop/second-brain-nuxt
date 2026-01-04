import { expect, test } from '@playwright/test'
import { TablePage } from './pages/TablePage'
import { NotePage } from './pages/NotePage'

test.describe('Table Feature', () => {
  test('table page loads and displays content', async ({ page }) => {
    const tablePage = new TablePage(page)

    await tablePage.goto()

    // Verify page heading
    await expect(tablePage.heading).toBeVisible()

    // Wait for content to load
    await tablePage.waitForTableLoad()

    // Verify table has rows
    const rowCount = await tablePage.getRowCount()
    expect(rowCount).toBeGreaterThan(0)

    // Verify item count is displayed
    await expect(tablePage.itemCount).toBeVisible()
  })

  test('can navigate from table row to note page', async ({ page }) => {
    const tablePage = new TablePage(page)
    const notePage = new NotePage(page)

    await tablePage.goto()
    await tablePage.waitForTableLoad()

    // Click first row and wait for navigation
    await tablePage.clickFirstRow()

    // Verify we navigated to a note page
    await expect(notePage.article).toBeVisible()
    await expect(page).not.toHaveURL('/table')
  })

  test('URL type filter shows filtered content', async ({ page }) => {
    const tablePage = new TablePage(page)

    // Navigate with type filter in URL
    await tablePage.gotoWithTypeFilter('book')
    await tablePage.waitForTableLoad()

    // Verify filter chip is shown
    await expect(page.getByText('book').first()).toBeVisible()

    // Verify table has rows (books exist in content)
    const rowCount = await tablePage.getRowCount()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('pagination updates URL and content', async ({ page }) => {
    const tablePage = new TablePage(page)

    await tablePage.goto()
    await tablePage.waitForTableLoad()

    // Skip if not enough items for pagination (< 26 items)
    const paginationVisible = await tablePage.paginationInfo.isVisible()
    if (!paginationVisible) {
      test.skip()
      return
    }

    // Capture initial state (content-agnostic)
    const initialFirstRowText = await tablePage.getFirstRowText()
    expect(page.url()).not.toContain('page=')

    // Navigate to page 2
    await tablePage.goToNextPage()

    // Verify URL changed
    await expect(page).toHaveURL(/[?&]page=2/)

    // Verify content changed (first row different)
    const newFirstRowText = await tablePage.getFirstRowText()
    expect(newFirstRowText).not.toBe(initialFirstRowText)
  })
})
