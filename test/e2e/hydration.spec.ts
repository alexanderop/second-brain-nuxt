import { test, expect, injectLocalStorage } from './test-utils'

const pages = ['/', '/about', '/stats', '/graph', '/books', '/table'] as const

const preferences = [
  { name: 'default', storage: {} },
  { name: 'dark mode', storage: { 'nuxt-color-mode': 'dark' } },
  { name: 'focus mode', storage: { 'second-brain-preferences': JSON.stringify({ focusMode: true }) } },
] as const

for (const pref of preferences) {
  test.describe(`Hydration: ${pref.name}`, () => {
    for (const url of pages) {
      test(`${url} has no hydration errors`, async ({ page, hydrationErrors }) => {
        if (Object.keys(pref.storage).length > 0) {
          await injectLocalStorage(page, pref.storage)
        }

        await page.goto(url, { waitUntil: 'networkidle' })

        // Give time for any delayed hydration warnings
        await page.waitForTimeout(1000)

        expect(hydrationErrors, `Hydration errors on ${url} with ${pref.name}`).toEqual([])
      })
    }
  })
}
