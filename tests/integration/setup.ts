/**
 * Integration test setup
 *
 * This file configures the Nuxt test environment for integration tests.
 * Use registerEndpoint from @nuxt/test-utils/runtime to mock API responses.
 *
 * Example:
 * ```ts
 * import { registerEndpoint, mountSuspended } from '@nuxt/test-utils/runtime'
 *
 * registerEndpoint('/api/graph', () => ({ nodes: [], edges: [] }))
 * const component = await mountSuspended(MyComponent)
 * ```
 */

// Currently no global setup needed - individual tests use registerEndpoint as needed
export {}
