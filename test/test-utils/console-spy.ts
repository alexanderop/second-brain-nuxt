/**
 * Console warning/error spy
 *
 * Catches unexpected console.warn and console.error calls during tests.
 * Fails the test if any unexpected warnings/errors are logged.
 *
 * Known harmless warnings can be added to the allowlist below.
 */
import { afterEach, beforeEach, vi, type MockInstance } from 'vitest'

const ALLOWED_PATTERNS: RegExp[] = [
  // Vue intlify i18n warnings
  /\[intlify\]/,
  // Vue expose() called multiple times
  /expose\(\) should be called only once/,
  // Vue Suspense experimental warning
  /<Suspense> is an experimental feature/,
  // Vue DevTools
  /__VUE_DEVTOOLS/,
]

function isAllowed(message: string): boolean {
  return ALLOWED_PATTERNS.some(pattern => pattern.test(message))
}

let warnSpy: MockInstance
let errorSpy: MockInstance

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  const unexpectedWarns = warnSpy.mock.calls
    .map(args => args.map(String).join(' '))
    .filter(msg => !isAllowed(msg))

  const unexpectedErrors = errorSpy.mock.calls
    .map(args => args.map(String).join(' '))
    .filter(msg => !isAllowed(msg))

  warnSpy.mockRestore()
  errorSpy.mockRestore()

  if (unexpectedWarns.length > 0) {
    throw new Error(
      `Unexpected console.warn calls:\n${unexpectedWarns.map(w => `  - ${w}`).join('\n')}`,
    )
  }

  if (unexpectedErrors.length > 0) {
    throw new Error(
      `Unexpected console.error calls:\n${unexpectedErrors.map(e => `  - ${e}`).join('\n')}`,
    )
  }
})
