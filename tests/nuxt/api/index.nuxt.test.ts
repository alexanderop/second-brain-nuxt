import { setup } from '@nuxt/test-utils/e2e'

// Single Nuxt server startup for all API tests
await setup({ server: true })

// Import test suites after server is ready
await import('./graph.tests')
await import('./backlinks.tests')
await import('./mentions.tests')
