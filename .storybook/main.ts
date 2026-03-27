import type { StorybookConfig } from "@storybook/vue3-vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { mergeConfig } from "vite";
import path from "node:path";

const config: StorybookConfig = {
  stories: ["../app/components/**/*.stories.ts"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [vue(), tailwindcss()],
      esbuild: {
        tsconfigRaw: {
          compilerOptions: {
            target: "ESNext",
            jsx: "preserve",
          },
        },
      },
      resolve: {
        alias: {
          "~": path.resolve(__dirname, "../app"),
          "~~": path.resolve(__dirname, ".."),
          "#shared": path.resolve(__dirname, "../shared"),
          "#components": path.resolve(__dirname, "./mocks/components"),
          "#imports": path.resolve(__dirname, "./mocks/imports"),
        },
      },
    });
  },
};

export default config;
