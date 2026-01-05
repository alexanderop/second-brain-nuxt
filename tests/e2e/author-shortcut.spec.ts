import { expect, test } from '@playwright/test'
import { NotePage } from './pages/NotePage'

test.describe('Author Shortcut', () => {
  test('a key opens author page for single-author note', async ({ page, context }) => {
    const notePage = new NotePage(page)
    // Note with single author: michael-thiessen
    await notePage.goto('12-design-patterns-in-vue')

    // Wait for page to fully load
    await expect(notePage.title).toBeVisible()

    // Listen for new page event before pressing the key
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.keyboard.press('a'),
    ])

    // Wait for the new page to load
    await newPage.waitForLoadState('networkidle')

    // Verify URL contains the author slug
    await expect(newPage).toHaveURL(/\/authors\/michael-thiessen/)
  })

  test('a key does nothing when note has no authors', async ({ page, context }) => {
    const notePage = new NotePage(page)
    // Personal note that may not have external authors - using an evergreen note
    await notePage.goto('about')

    await expect(notePage.title).toBeVisible()

    // Set up listener to detect if new page opens
    let newPageOpened = false
    context.on('page', () => {
      newPageOpened = true
    })

    // Press the a key
    await page.keyboard.press('a')

    // Wait a bit to ensure no navigation happens
    await page.waitForTimeout(500)

    // Verify no new page was opened
    expect(newPageOpened).toBe(false)
  })

  test('a key shows picker modal for multi-author note', async ({ page }) => {
    const notePage = new NotePage(page)
    // This test requires a note with multiple authors
    // Skip if no multi-author content exists
    await notePage.goto('test-multi-author-note')

    // Check if page exists (skip test if not)
    const pageExists = await page.locator('article').count() > 0
    if (!pageExists) {
      test.skip()
      return
    }

    await page.keyboard.press('a')

    // Verify picker modal appears
    const picker = page.getByRole('dialog')
    await expect(picker).toBeVisible()
  })

  test('selecting author from picker opens author page', async ({ page, context }) => {
    const notePage = new NotePage(page)
    // This test requires a note with multiple authors
    await notePage.goto('test-multi-author-note')

    // Check if page exists (skip test if not)
    const pageExists = await page.locator('article').count() > 0
    if (!pageExists) {
      test.skip()
      return
    }

    await page.keyboard.press('a')

    // Wait for picker modal
    const picker = page.getByRole('dialog')
    await expect(picker).toBeVisible()

    // Click on first author in the list
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      picker.getByRole('button').first().click(),
    ])

    await newPage.waitForLoadState('networkidle')
    await expect(newPage).toHaveURL(/\/authors\//)
  })
})
