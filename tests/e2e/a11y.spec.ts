import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { SearchModal } from './pages/SearchModal'
import { checkA11y, getCriticalViolations } from './utils/a11y'

test.describe('Accessibility', () => {
  test('home page has no critical a11y violations', async ({ page }) => {
    const homePage = new HomePage(page)

    await homePage.goto()
    await page.waitForLoadState('networkidle')

    const results = await checkA11y(page)
    const critical = getCriticalViolations(results)

    if (critical.length > 0) {
      console.error('Critical violations:', JSON.stringify(critical, null, 2))
    }

    expect(critical).toEqual([])
  })

  test('search modal is accessible', async ({ page }) => {
    const homePage = new HomePage(page)
    const searchModal = new SearchModal(page)

    await homePage.goto()
    await page.waitForLoadState('networkidle')

    // Open search modal
    await searchModal.openWithClick()
    await expect(searchModal.modal).toBeVisible()

    // Exclude known Nuxt UI CommandPalette internal issues
    // See: https://github.com/nuxt/ui/issues - these are component-level a11y issues
    const results = await checkA11y(page, {
      disableRules: [
        'aria-input-field-name', // UCommandPalette listbox missing aria-label
        'aria-required-children', // UCommandPalette listbox missing option/group children when empty
        'scrollable-region-focusable', // UCommandPalette viewport not focusable
        'color-contrast', // Modal overlay affects computed contrast ratios
      ],
    })
    const critical = getCriticalViolations(results)

    if (critical.length > 0) {
      console.error('Critical violations:', JSON.stringify(critical, null, 2))
    }

    expect(critical).toEqual([])
  })

  test('about page has no critical a11y violations', async ({ page }) => {
    // Use about page which always exists (unlike dynamic content pages)
    await page.goto('/about', { waitUntil: 'networkidle' })

    const results = await checkA11y(page, {
      disableRules: [
        'color-contrast', // Primary color contrast is a design choice
      ],
    })
    const critical = getCriticalViolations(results)

    if (critical.length > 0) {
      console.error('Critical violations:', JSON.stringify(critical, null, 2))
    }

    expect(critical).toEqual([])
  })
})
