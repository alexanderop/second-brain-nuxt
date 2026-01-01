import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['server/**/*.ts', 'app/composables/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.nuxt.test.ts',
        // Vue composables - require Nuxt environment to test
        'app/composables/useBacklinks.ts',
        'app/composables/useMentions.ts',
        'app/composables/useListNavigation.ts',
        'app/composables/usePreferences.ts',
        'app/composables/useGraphFilters.ts',
        // Nitro plugin - logic extracted to server/utils/wikilinks.ts
        'server/plugins/**/*.ts',
      ],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
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
          },
        },
      },
      // API unit tests - mocked dependencies, fast
      {
        test: {
          name: 'api-unit',
          include: ['tests/api-unit/**/*.test.ts'],
          environment: 'node',
        },
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./', import.meta.url)),
            '~~': fileURLToPath(new URL('./', import.meta.url)),
          },
        },
      },
      // Nuxt environment tests - composables, API routes (full e2e)
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.nuxt.test.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
