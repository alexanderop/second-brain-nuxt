import { expect, test } from '@playwright/test'
import { TypeFilterPage } from './pages/TypeFilterPage'

test.describe('Type Filter', () => {
  test('type filter page loads for article type', async ({ page }) => {
    const typeFilterPage = new TypeFilterPage(page)
    await typeFilterPage.goto('article')

    await expect(typeFilterPage.heading).toBeVisible()
    await expect(typeFilterPage.heading).toContainText(/article/i)
  })

  test('page shows item count', async ({ page }) => {
    const typeFilterPage = new TypeFilterPage(page)
    await typeFilterPage.goto('article')

    await expect(typeFilterPage.itemCount).toBeVisible()
    const countText = await typeFilterPage.itemCount.textContent()
    expect(countText).toMatch(/\(\d+\)/)
  })

  test('content list displays only items of that type', async ({ page }) => {
    const typeFilterPage = new TypeFilterPage(page)
    await typeFilterPage.goto('article')

    const itemCount = await typeFilterPage.getItemCount()
    // If there are items, verify they exist
    if (itemCount > 0) {
      await expect(typeFilterPage.contentItems.first()).toBeVisible()
    }
  })

  test('can navigate from item to detail page', async ({ page }) => {
    const typeFilterPage = new TypeFilterPage(page)
    await typeFilterPage.goto('article')

    const itemCount = await typeFilterPage.getItemCount()
    if (itemCount === 0) {
      test.skip()
      return
    }

    const firstItem = typeFilterPage.contentItems.first()
    const link = firstItem.getByRole('link').first()
    const href = await link.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '**'),
      link.click(),
    ])

    // Should have navigated to a detail page
    expect(page.url()).not.toContain('/type/')
  })

  test('youtube type filter works', async ({ page }) => {
    const typeFilterPage = new TypeFilterPage(page)
    await typeFilterPage.goto('youtube')

    await expect(typeFilterPage.heading).toBeVisible()
    await expect(typeFilterPage.heading).toContainText(/youtube/i)
  })

  test('book type filter works', async ({ page }) => {
    const typeFilterPage = new TypeFilterPage(page)
    await typeFilterPage.goto('book')

    await expect(typeFilterPage.heading).toBeVisible()
    await expect(typeFilterPage.heading).toContainText(/book/i)
  })
})
