/**
 * Nuxt test setup
 *
 * Merged setup for both Nuxt integration tests and browser component tests.
 * Configures the Nuxt test environment with browser support.
 *
 * - Integration tests: use `registerEndpoint` + `mountSuspended` from @nuxt/test-utils/runtime
 * - Component tests: use `render` from vitest-browser-vue for D3/visual components
 */

// Currently no global setup needed - individual tests use registerEndpoint as needed
export {};
