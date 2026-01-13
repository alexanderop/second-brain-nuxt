import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Vitest config for Stryker mutation testing
// Includes both unit tests and integration tests
export default defineConfig({
  test: {
    projects: [
      // Unit tests - fast, pure functions, no Nuxt runtime
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '~~': fileURLToPath(new URL('./', import.meta.url)),
            '#imports': fileURLToPath(new URL('./tests/mocks/imports.ts', import.meta.url)),
          },
        },
      },

      // Integration tests - Nuxt environment
      await defineVitestProject({
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              mock: {
                intersectionObserver: true,
                indexedDb: true,
              },
            },
          },
          setupFiles: ['./tests/integration/setup.ts'],
        },
      }),
    ],
  },
})
