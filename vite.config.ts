import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from "vite-plus/test/browser-playwright";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  // Oxlint configuration (migrated from .oxlintrc.json)
  lint: {
    plugins: ["typescript", "import", "unicorn", "vitest", "oxc", "vue"],
    jsPlugins: ["./eslint-plugin-error-handling/index.ts", "./eslint-plugin-nuxt-content/index.ts"],
    env: {
      browser: true,
      es2024: true,
      node: true,
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: "error",
      "no-eval": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-debugger": "error",
      "no-empty": "error",
      "no-extra-boolean-cast": "error",
      "no-irregular-whitespace": "error",
      "no-loss-of-precision": "error",
      "no-unsafe-negation": "error",
      "valid-typeof": "error",
      "no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/no-self-import": "error",
      "unicorn/no-instanceof-array": "error",
      "unicorn/no-new-array": "error",
      "unicorn/prefer-number-properties": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-constructor-return": "error",
      "no-iterator": "error",
      "no-multi-str": "error",
      "no-new-wrappers": "error",
      "no-proto": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      "no-useless-concat": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "prefer-template": "error",
      radix: "error",
      "symbol-description": "error",
      "oxc/no-const-enum": "error",
      "oxc/no-accumulating-spread": "warn",
      "vue/no-dupe-keys": "error",
      "vue/no-duplicate-attributes": "error",
      "vue/no-template-shadow": "error",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
      "vitest/expect-expect": "error",
      "vitest/no-identical-title": "error",
      "vitest/valid-expect": "error",
      "vitest/no-standalone-expect": "error",
      "vitest/prefer-to-be": "warn",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/throw-new-error": "error",
      "unicorn/prefer-type-error": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      // Rules migrated from ESLint
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "vue",
              importNames: ["reactive"],
              message: "Use ref() instead of reactive() for consistent reactivity patterns.",
            },
          ],
        },
      ],
      complexity: ["error", { max: 10 }],
      "vue/max-props": ["error", { maxProps: 6 }],
      // Custom JS plugin rules
      "error-handling/no-try-catch": "error",
      "nuxt-content/require-async-data": "error",
    },
    overrides: [
      {
        files: ["**/*.spec.ts", "**/test/**"],
        rules: {
          "@typescript-eslint/no-explicit-any": "warn",
          "vitest/no-standalone-expect": "off",
        },
      },
      {
        files: ["eslint-plugin-*/**/*.ts"],
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
          "error-handling/no-try-catch": "off",
        },
      },
      {
        files: ["**/*.vue"],
        rules: {
          "max-lines": ["warn", { max: 600 }],
        },
      },
      {
        files: ["**/stores/**"],
        rules: {
          "no-restricted-imports": "off",
        },
      },
      {
        files: ["**/shared/utils/tryCatch.ts"],
        rules: {
          "error-handling/no-try-catch": "off",
        },
      },
    ],
    ignorePatterns: [
      "node_modules",
      ".nuxt",
      ".output",
      ".claude",
      "dist",
      "playwright-report",
      "test-results",
      "content/.obsidian",
      ".lighthouserc.cjs",
    ],
  },

  // Task caching — only terminal-output tasks (not file-producing builds)
  run: {
    tasks: {
      typecheck: {
        command: "nuxt typecheck",
      },
      knip: {
        command: "knip",
      },
      "lint:es": {
        command: "eslint .",
      },
      "lint:md": {
        command: "markdownlint-cli2 'content/**/*.md'",
      },
    },
  },

  // Staged-file checks (replaces lint-staged + simple-git-hooks)
  staged: {
    "*.{ts,vue,js,mjs}": "vp check --fix",
    "*.vue": "eslint --fix",
    "content/**/*.md": "eslint --fix && markdownlint-cli2 --fix",
  },

  // Vitest configuration (migrated from vitest.config.ts)
  test: {
    reporters: process.env.CI
      ? ["default", ["junit", { outputFile: "./test-results/junit.xml" }]]
      : ["default"],
    coverage: {
      provider: "v8",
      // Only track unit-testable code: server utilities, pure composables, and app utilities
      include: [
        "server/utils/**/*.ts",
        "app/composables/**/*.ts",
        "app/utils/**/*.ts",
        "shared/utils/**/*.ts",
      ],
      exclude: [
        "**/*.spec.ts",
        "**/*.nuxt.spec.ts",
        // Vue composables - require Nuxt environment to test (covered by E2E)
        "app/composables/useBacklinks.ts",
        "app/composables/useMentions.ts",
        "app/composables/useListNavigation.ts",
        "app/composables/usePreferences.ts",
        "app/composables/useGraphFilters.ts",
        // Config/site composables - trivial wrappers, not worth unit testing
        "app/composables/useSiteConfig.ts",
        "app/composables/usePageTitle.ts",
        "app/composables/useFocusMode.ts",
        "app/composables/useTocVisibility.ts",
        "app/composables/useTableFilterMenus.ts",
        // useContentTable - pure functions tested (168 tests), composable wrapper needs Nuxt
        "app/composables/useContentTable.ts",
        // useRandomNote - pure selection tested, navigation wrapper needs Nuxt
        "app/composables/useRandomNote.ts",
        // App utils not part of FC/IS extraction (D3/graph helpers, YouTube embed utils)
        "app/utils/graphColors.ts",
        "app/utils/graphForces.ts",
        "app/utils/graphNormalize.ts",
        "app/utils/youtube.ts",
        // Nitro plugin - logic extracted to server/utils/wikilinks.ts
        "server/plugins/**/*.ts",
      ],
      reporter: ["text", "html", "junit"],
      reportsDirectory: "./coverage",
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
          name: "unit",
          include: ["test/unit/**/*.spec.ts"],
          environment: "node",
          setupFiles: ["./test/test-utils/console-spy.ts"],
        },
        resolve: {
          alias: {
            "~": fileURLToPath(new URL("./app", import.meta.url)),
            "~~": fileURLToPath(new URL("./", import.meta.url)),
            "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
            "#imports": fileURLToPath(
              new URL("./test/test-utils/imports-mock.ts", import.meta.url),
            ),
          },
        },
      },

      // Layer 2a: Nuxt integration tests - Nuxt environment with registerEndpoint
      // Tests pages, composables, and a11y that need Nuxt context
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: [
            "test/nuxt/pages/**/*.spec.ts",
            "test/nuxt/composables/**/*.spec.ts",
            "test/nuxt/a11y.spec.ts",
          ],
          environment: "nuxt",
          environmentOptions: {
            nuxt: {
              mock: {
                intersectionObserver: true,
                indexedDb: true,
              },
            },
          },
          setupFiles: ["./test/nuxt/setup.ts", "./test/test-utils/console-spy.ts"],
        },
      }),

      // Layer 2b: Nuxt browser tests - real Chromium for D3/visual components
      // Tests D3.js graphs, charts requiring real browser DOM
      {
        plugins: [
          vue(),
          tailwindcss(),
          AutoImport({
            imports: ["vue"],
            dts: false,
          }),
        ],
        test: {
          name: "nuxt-browser",
          include: ["test/nuxt/components/**/*.spec.ts"],
          setupFiles: ["./test/nuxt/browser-setup.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
        resolve: {
          alias: {
            "~": fileURLToPath(new URL("./app", import.meta.url)),
            "~~": fileURLToPath(new URL("./", import.meta.url)),
            "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
            // vitest-browser-vue imports @vitest/browser/context directly, but vite-plus
            // bundles @vitest/browser under vitest/browser/*. Alias to the vite-plus re-export.
            "@vitest/browser/context": "vitest/browser/context",
          },
          dedupe: ["vue"],
        },
        optimizeDeps: {
          include: ["vue", "d3"],
        },
      },
    ],
  },
});
