import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface A11yOptions {
  disableRules?: string[]
}

/**
 * Run axe-core accessibility analysis on the current page.
 * Disables Vue DevTools to avoid false positives during testing.
 */
export async function checkA11y(page: Page, options?: A11yOptions) {
  // Disable Vue DevTools to avoid false positives
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Window type augmentation for Vue DevTools
    delete (window as Window & { __VUE_DEVTOOLS_GLOBAL_HOOK__?: unknown }).__VUE_DEVTOOLS_GLOBAL_HOOK__
  })

  const builder = new AxeBuilder({ page })

  if (options?.disableRules) {
    builder.disableRules(options.disableRules)
  }

  return builder.analyze()
}

/**
 * Filter violations by impact level (critical or serious).
 */
export function getCriticalViolations(results: Awaited<ReturnType<typeof checkA11y>>) {
  return results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  )
}
