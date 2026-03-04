import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'app/app.vue!',
    'app/pages/**/*.vue!',
    'app/components/**/*.vue!',
    'app/composables/**/*.ts!',
    'app/utils/**/*.ts!',
    'app/layouts/**/*.vue!',
    'app/router.options.ts!',
    'app/types/mermaid.d.ts!',
    'app.config.ts!',
    'server/**/*.ts!',
    'shared/**/*.ts!',
    'content.config.ts!',
    'site.config.ts!',
    'features.config.ts!',
    'pwa-assets.config.ts!',
    'vitest.stryker.config.ts!',
    'scripts/**/*.ts',
    'eslint-plugin-frontmatter/**/*.ts!',
    'eslint-plugin-error-handling/**/*.ts!',
    'eslint-plugin-nuxt-content/**/*.ts!',
  ],
  project: [
    '**/*.{ts,vue,js,mjs}',
    '!tests/**',
    '!content/**',
    '!.nuxt/**',
    '!.output/**',
    '!.claude/**',
    '!ralph/**',
    '!coverage/**',
  ],
  ignoreDependencies: [
    '@iconify-json/*',
    // Used by @nuxt/content internally
    '@portaljs/remark-wiki-link',
    // Test dependencies used via config, not in scanned source
    '@axe-core/playwright',
    'vitest-axe',
  ],
  ignoreBinaries: [
    // Used via npx in package.json scripts
    'tsx',
  ],
  ignoreUnresolved: [
    '#components',
  ],
}

export default config
