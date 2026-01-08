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

  test('G then B navigates to books page from home', async ({ page }) => {
    // Start from home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Verify we're on the home page
    await expect(page).toHaveURL('/')

    // Press G then B to navigate to books
    await page.keyboard.press('g')
    await page.keyboard.press('b')

    // Verify navigation to books page
    await expect(page).toHaveURL('/books')

    // Verify books page content loads
    await expect(page.getByRole('heading', { name: 'Books', level: 1 })).toBeVisible()
  })

  test('G then G navigates to graph page', async ({ page }) => {
    // Start from home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Verify we're on the home page
    await expect(page).toHaveURL('/')

    // Press G then G to navigate to graph
    await page.keyboard.press('g')
    await page.keyboard.press('g')

    // Verify navigation to graph page
    await expect(page).toHaveURL('/graph')

    // Verify graph page content loads (h1 is "Knowledge Graph")
    await expect(page.getByRole('heading', { name: 'Knowledge Graph', level: 1 })).toBeVisible()
  })
})
