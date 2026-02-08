import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      // Only track unit-testable code: server utilities, pure composables, and app utilities
      include: ['server/utils/**/*.ts', 'app/composables/**/*.ts', 'app/utils/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.nuxt.test.ts',
        // Vue composables - require Nuxt environment to test (covered by E2E)
        'app/composables/useBacklinks.ts',
        'app/composables/useMentions.ts',
        'app/composables/useListNavigation.ts',
        'app/composables/usePreferences.ts',
        'app/composables/useGraphFilters.ts',
        // Config/site composables - trivial wrappers, not worth unit testing
        'app/composables/useSiteConfig.ts',
        'app/composables/usePageTitle.ts',
        'app/composables/useFocusMode.ts',
        'app/composables/useTocVisibility.ts',
        'app/composables/useTableFilterMenus.ts',
        // useContentTable - pure functions tested (168 tests), composable wrapper needs Nuxt
        'app/composables/useContentTable.ts',
        // useRandomNote - pure selection tested, navigation wrapper needs Nuxt
        'app/composables/useRandomNote.ts',
        // App utils not part of FC/IS extraction (D3/graph helpers, YouTube embed utils)
        'app/utils/graphColors.ts',
        'app/utils/graphForces.ts',
        'app/utils/graphNormalize.ts',
        'app/utils/youtube.ts',
        // Nitro plugin - logic extracted to server/utils/wikilinks.ts
        'server/plugins/**/*.ts',
      ],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        // Enforced 100% coverage for tracked files
        lines: 100,
        functions: 100,
        branches: 99, // 99% due to defensive ?? in mentions.ts (unreachable branch)
        statements: 100,
      },
    },
    projects: [
      // Layer 1: Unit tests - fast, pure functions, no Nuxt runtime
      // Tests server/utils, pure composables, type utilities
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

      // Layer 2: Integration tests - Nuxt environment with registerEndpoint
      // Tests components + composables that need Nuxt context
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

      // Layer 3: Component tests - isolated components in real browser
      // Tests D3.js graphs, charts, visual components
      {
        plugins: [
          vue(),
          tailwindcss(),
          AutoImport({
            imports: ['vue'],
            dts: false,
          }),
        ],
        test: {
          name: 'component',
          include: ['tests/component/**/*.test.ts'],
          setupFiles: ['./tests/component/setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '~~': fileURLToPath(new URL('./', import.meta.url)),
          },
          dedupe: ['vue'],
        },
        optimizeDeps: {
          include: ['vue', 'd3'],
        },
      },
    ],
  },
})
