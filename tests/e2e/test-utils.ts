import { test as base, type ConsoleMessage } from '@playwright/test'

/**
 * Extended test fixture that captures hydration errors during navigation.
 * Use with matrix testing to verify pages hydrate cleanly across preferences.
 */
export const test = base.extend<{ hydrationErrors: string[] }>({
  hydrationErrors: async ({ page }, use) => {
    const errors: string[] = []

    const patterns = [
      'Hydration completed but contains mismatches',
      'Hydration mismatch',
      'hydration mismatch',
      'An error occurred during hydration',
      'There was an error while hydrating',
      'Hydration node mismatch',
      'data-server-rendered',
    ]

    const handler = (msg: ConsoleMessage) => {
      const text = msg.text()
      if (patterns.some(p => text.includes(p))) {
        errors.push(text)
      }
    }

    page.on('console', handler)
    await use(errors)
    page.off('console', handler)
  },
})

export { expect } from '@playwright/test'

/**
 * Inject localStorage values before page navigation.
 * Uses page.addInitScript to set values before any JS runs.
 */
export async function injectLocalStorage(
  page: import('@playwright/test').Page,
  entries: Record<string, string>,
): Promise<void> {
  await page.addInitScript((items) => {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, value)
    }
  }, entries)
}
