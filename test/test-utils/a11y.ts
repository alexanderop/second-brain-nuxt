/**
 * Accessibility testing utilities using vitest-axe
 *
 * Usage:
 * ```typescript
 * import { axe } from '../test-utils/a11y'
 *
 * it('has no accessibility violations', async () => {
 *   const page = await mountSuspended(MyPage)
 *   const results = await axe(page.element)
 *   expect(results).toHaveNoViolations()
 * })
 * ```
 *
 * Note: Automated tests catch ~30% of a11y issues.
 * Manual testing and user feedback remain essential.
 */
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";

// Augment Vitest's Assertion interface for vitest-axe matchers
declare module "vitest" {
  interface Assertion<T> extends CustomMatchers<T> {}
}

interface CustomMatchers<_T = unknown> {
  toHaveNoViolations(): void;
}

expect.extend(matchers);

export { axe };
