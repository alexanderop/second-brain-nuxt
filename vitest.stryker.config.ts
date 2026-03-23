import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

// Vitest config for Stryker mutation testing
// Includes both unit tests and nuxt tests
export default defineConfig({
  test: {
    projects: [
      // Unit tests - fast, pure functions, no Nuxt runtime
      {
        test: {
          name: "unit",
          include: ["test/unit/**/*.spec.ts"],
          environment: "node",
        },
        resolve: {
          alias: {
            "~": fileURLToPath(new URL("./app", import.meta.url)),
            "~~": fileURLToPath(new URL("./", import.meta.url)),
            "#imports": fileURLToPath(
              new URL("./test/test-utils/imports-mock.ts", import.meta.url),
            ),
          },
        },
      },

      // Nuxt tests - Nuxt environment
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.spec.ts"],
          environment: "nuxt",
          environmentOptions: {
            nuxt: {
              mock: {
                intersectionObserver: true,
                indexedDb: true,
              },
            },
          },
          setupFiles: ["./test/nuxt/setup.ts"],
        },
      }),
    ],
  },
});
