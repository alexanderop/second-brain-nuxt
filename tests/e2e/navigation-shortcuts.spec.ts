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

  test('G then T navigates to tags page', async ({ page }) => {
    // Start from home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Verify we're on the home page
    await expect(page).toHaveURL('/')

    // Press G then T to navigate to tags
    await page.keyboard.press('g')
    await page.keyboard.press('t')

    // Verify navigation to tags page
    await expect(page).toHaveURL('/tags')

    // Verify tags page content loads
    await expect(page.getByRole('heading', { name: 'Tags', level: 1 })).toBeVisible()
  })

  test('G then A navigates to authors page', async ({ page }) => {
    // Start from home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Verify we're on the home page
    await expect(page).toHaveURL('/')

    // Press G then A to navigate to authors
    await page.keyboard.press('g')
    await page.keyboard.press('a')

    // Verify navigation to authors page
    await expect(page).toHaveURL('/authors')

    // Verify authors page content loads
    await expect(page.getByRole('heading', { name: 'Authors', level: 1 })).toBeVisible()
  })
})

test.describe('Action Shortcuts - List Navigation', () => {
  test('Enter opens the selected item', async ({ page }) => {
    // Go to home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Get the first content card and its link
    const firstCard = page.locator('article').first()
    await expect(firstCard).toBeVisible()

    // Get the href of the link inside the first card
    const firstLink = firstCard.locator('a').first()
    const href = await firstLink.getAttribute('href')
    expect(href).toBeTruthy()

    // Press J to select the first item
    await page.keyboard.press('j')

    // Verify first card is selected
    await expect(firstCard).toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)

    // Press Enter to open the selected item
    await page.keyboard.press('Enter')

    // Verify navigation to the note page
    await expect(page).toHaveURL(href!)

    // Verify the note page content loads (should have the note's title as h1)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('J moves selection down and K moves selection up on home page', async ({ page }) => {
    // Go to home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Get all content cards (articles)
    const cards = page.locator('article')
    await expect(cards.first()).toBeVisible()

    // Initially no card should be selected (no muted background)
    await expect(cards.first()).not.toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)

    // Press J to select the first item (index goes from -1 to 0)
    await page.keyboard.press('j')

    // First card should now be selected (has muted background class)
    await expect(cards.first()).toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)

    // Press K - should stay at first item (can't go below 0)
    await page.keyboard.press('k')
    await expect(cards.first()).toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)

    // Press J to move to second item
    await page.keyboard.press('j')

    // First card should no longer be selected
    await expect(cards.first()).not.toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)

    // Second card should now be selected
    await expect(cards.nth(1)).toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)

    // Press K to go back to first item
    await page.keyboard.press('k')
    await expect(cards.first()).toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)
    await expect(cards.nth(1)).not.toHaveClass(/bg-\[var\(--ui-bg-muted\)\]/)
  })
})

test.describe('Action Shortcuts - Note Page', () => {
  test('O opens resource link in new tab', async ({ page, context }) => {
    // Navigate to a note with a URL field
    await page.goto('/12-design-patterns-in-vue', { waitUntil: 'networkidle' })

    // Wait for page to fully load
    await expect(page.locator('h1').first()).toBeVisible()

    // Listen for new page event before pressing the key
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.keyboard.press('o'),
    ])

    // Wait for the new page to load
    await newPage.waitForLoadState('networkidle')

    // Verify the new page URL contains the expected domain
    await expect(newPage).toHaveURL(/michaelnthiessen\.com/)

    // Verify original page remains open
    await expect(page).toHaveURL('/12-design-patterns-in-vue')
  })

  test('O does nothing when note has no URL', async ({ page, context }) => {
    // Navigate to a note without a URL field (evergreen note)
    await page.goto('/second-brain-system', { waitUntil: 'networkidle' })

    // Wait for page to fully load
    await expect(page.locator('h1').first()).toBeVisible()

    // Set up listener to detect if new page opens
    let newPageOpened = false
    context.on('page', () => {
      newPageOpened = true
    })

    // Press the o key
    await page.keyboard.press('o')

    // Wait a bit to ensure no navigation happens
    await page.waitForTimeout(500)

    // Verify no new page was opened
    expect(newPageOpened).toBe(false)
  })
})
