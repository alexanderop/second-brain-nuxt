import { expect, test } from '@playwright/test'

test.describe('Navigation Shortcuts', () => {
  test('G then H navigates to home page from /books', async ({ page }) => {
    // Start from /books page
    await page.goto('/books', { waitUntil: 'networkidle' })

    // Verify we're on the books page
    await expect(page).toHaveURL(/\/books/)

    // Press G then H to navigate home
    await page.keyboard.press('g')
    await page.keyboard.press('h')

    // Verify navigation to home page
    await expect(page).toHaveURL('/')

    // Verify home page content loads
    await expect(page.getByRole('heading', { name: 'Recent Additions', level: 1 })).toBeVisible()
  })
})
