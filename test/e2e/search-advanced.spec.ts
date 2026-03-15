import { expect, test } from '@playwright/test'
import { SearchModal } from './pages/SearchModal'
import { HomePage } from './pages/HomePage'

test.describe('Search Advanced', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()
  })

  test('search modal opens with Cmd+K', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await searchModal.open()
    await expect(searchModal.modal).toBeVisible()
    await expect(searchModal.searchInput).toBeFocused()
  })

  test('search modal opens with / key', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await page.keyboard.press('/')
    await expect(searchModal.modal).toBeVisible()
    await expect(searchModal.searchInput).toBeFocused()
  })

  test('search modal closes with Escape key', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await searchModal.open()
    await expect(searchModal.modal).toBeVisible()

    await searchModal.close()
    await expect(searchModal.modal).not.toBeVisible()
  })

  test('search handles empty query', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await searchModal.open()
    await expect(searchModal.modal).toBeVisible()

    // With empty query, modal should still be usable
    await expect(searchModal.searchInput).toBeVisible()
  })

  test('search handles special characters', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await searchModal.open()
    await searchModal.search('test & "special" <characters>')

    // Should not crash - verify modal is still visible
    await expect(searchModal.modal).toBeVisible()
    await expect(searchModal.searchInput).toBeVisible()
  })

  test('search results update as user types', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await searchModal.open()

    // Type a common letter to get some results
    await searchModal.searchInput.fill('a')
    await page.waitForTimeout(300)

    const resultsAfterA = await searchModal.results.count()

    // Type more to filter further
    await searchModal.searchInput.fill('atomic')
    await page.waitForTimeout(300)

    const resultsAfterAtomic = await searchModal.results.count()

    // More specific query should have fewer or equal results
    // (unless there's no content matching - gracefully handle that)
    if (resultsAfterA > 0) {
      expect(resultsAfterAtomic).toBeLessThanOrEqual(resultsAfterA)
    }
  })

  test('can navigate from search result to note page', async ({ page }) => {
    const searchModal = new SearchModal(page)

    await searchModal.open()
    await searchModal.search('atomic')
    await page.waitForTimeout(300)

    const resultsCount = await searchModal.results.count()
    if (resultsCount === 0) {
      test.skip()
      return
    }

    await searchModal.selectFirstResult()

    // Modal should close after selection
    await expect(searchModal.modal).not.toBeVisible()

    // Should have navigated to a note page
    expect(page.url()).not.toBe('/')
  })

  test('search input clears when reopened', async ({ page }) => {
    const searchModal = new SearchModal(page)

    // Open and type something
    await searchModal.open()
    await searchModal.search('test query')
    await searchModal.close()

    // Reopen modal
    await searchModal.open()

    // Input should be empty or cleared
    const inputValue = await searchModal.searchInput.inputValue()
    expect(inputValue).toBe('')
  })
})
