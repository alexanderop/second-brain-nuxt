import { setup } from '@nuxt/test-utils/e2e'

// Single Nuxt server startup for all API tests
// Increase timeout for CI environments which are slower than local machines
await setup({ server: true, setupTimeout: 180_000 })

// Import test suites after server is ready
await import('./graph.nuxt.test')
await import('./backlinks.nuxt.test')
await import('./mentions.nuxt.test')
await import('./table.nuxt.test')
