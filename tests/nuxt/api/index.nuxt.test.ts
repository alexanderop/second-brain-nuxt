import { setup } from '@nuxt/test-utils/e2e'

// Single Nuxt server startup for all API tests
await setup({ server: true })

// Import test suites after server is ready
await import('./graph.nuxt.test')
await import('./backlinks.nuxt.test')
await import('./mentions.nuxt.test')
await import('./table.nuxt.test')
