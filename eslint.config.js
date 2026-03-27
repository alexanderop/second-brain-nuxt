import markdown from '@eslint/markdown';
import vuePlugin from 'eslint-plugin-vue';
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

import errorHandling from './eslint-plugin-error-handling/index.ts';
import frontmatter from './eslint-plugin-frontmatter/index.ts';
import nuxtContent from './eslint-plugin-nuxt-content/index.ts';

// Content type directories (profiles/meta content, not notes)
const PROFILE_DIRS = ['authors', 'newsletters', 'pages', 'podcasts', 'tweets'];
const profileIgnores = PROFILE_DIRS.map((d) => `content/${d}/**/*.md`);

// Shared markdown rules
const baseMarkdownRules = {
  'markdown/fenced-code-language': 'warn',
  'markdown/heading-increment': 'error',
  'markdown/no-empty-links': 'error',
  'markdown/no-missing-label-refs': 'off',
};

// Minimal ESLint config for rules oxlint doesn't support
// Main linting is done by oxlint (faster)
export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      '.claude/**',
      '**/apps/**/.nuxt/**',
      '**/apps/**/.output/**',
      'dist/**',
      'content/.obsidian/**',
      'content/Readwise/**',
      'content/Excalidraw/**',
      'content/newsletter-drafts/**',
      'content/blog-ideas/**',
      'content/_obsidian-templates/**',
      'specs/**',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Ban else blocks - use early return or ternary instead
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement > .alternate',
          message: 'Use early return or ternary instead of else.',
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      vue: vuePlugin,
      'vuejs-accessibility': vuejsAccessibility,
      'error-handling': errorHandling,
      'nuxt-content': nuxtContent,
    },
    rules: {
      // Enforce tryCatch helper instead of try-catch blocks (JS plugins can't parse Vue SFCs)
      'error-handling/no-try-catch': 'error',
      // Enforce useAsyncData wrapper for queryCollection in components (JS plugins can't parse Vue SFCs)
      'nuxt-content/require-async-data': 'error',
      // Limit template nesting depth for maintainability
      'vue/max-template-depth': ['error', { maxDepth: 10 }],
      // Vue accessibility rules (manually specified to avoid plugin conflicts)
      'vuejs-accessibility/alt-text': 'error',
      'vuejs-accessibility/anchor-has-content': 'error',
      'vuejs-accessibility/aria-props': 'error',
      'vuejs-accessibility/aria-role': 'error',
      'vuejs-accessibility/aria-unsupported-elements': 'error',
      'vuejs-accessibility/click-events-have-key-events': 'error',
      'vuejs-accessibility/form-control-has-label': 'error',
      'vuejs-accessibility/heading-has-content': 'error',
      'vuejs-accessibility/iframe-has-title': 'error',
      'vuejs-accessibility/interactive-supports-focus': 'error',
      'vuejs-accessibility/label-has-for': 'error',
      'vuejs-accessibility/media-has-caption': 'error',
      'vuejs-accessibility/mouse-events-have-key-events': 'error',
      'vuejs-accessibility/no-access-key': 'error',
      'vuejs-accessibility/no-autofocus': 'error',
      'vuejs-accessibility/no-distracting-elements': 'error',
      'vuejs-accessibility/no-redundant-roles': 'error',
      'vuejs-accessibility/no-static-element-interactions': 'error',
      'vuejs-accessibility/role-has-required-aria-props': 'error',
      'vuejs-accessibility/tabindex-no-positive': 'error',
      // Ban else blocks - use early return or ternary instead
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement > .alternate',
          message: 'Use early return or ternary instead of else.',
        },
      ],
    },
  },
  {
    // Prevent barrel files in Nuxt auto-import directories (causes duplicate import warnings)
    files: ['server/utils/**/*.ts', 'app/composables/**/*.ts', 'app/utils/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement > .alternate',
          message: 'Use early return or ternary instead of else.',
        },
        {
          selector: 'ExportAllDeclaration',
          message:
            'Barrel exports cause duplicate auto-imports in Nuxt. Export from the original file.',
        },
        {
          selector: 'ExportNamedDeclaration[source]',
          message:
            'Re-exports cause duplicate auto-imports in Nuxt. Import and use directly instead.',
        },
      ],
    },
  },
  {
    // Allow autofocus on search page - it's the primary interaction
    files: ['**/pages/search.vue'],
    rules: {
      'vuejs-accessibility/no-autofocus': 'off',
    },
  },
  {
    // Markdown linting for content notes (not profiles)
    files: ['content/**/*.md'],
    ignores: profileIgnores,
    plugins: { markdown, frontmatter },
    language: 'markdown/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: {
      ...baseMarkdownRules,
      'markdown/require-alt-text': 'warn',
      // Frontmatter validation rules
      'frontmatter/valid-url': 'error',
      'frontmatter/valid-author-refs': 'error',
      'frontmatter/valid-wiki-links': 'warn',
      'frontmatter/valid-tag-format': 'warn',
      'frontmatter/valid-type': 'error',
      'frontmatter/required-fields': 'error',
      'frontmatter/no-duplicate-tags': 'warn',
      'frontmatter/no-future-dates': 'error',
      'frontmatter/valid-rating': 'error',
      'frontmatter/no-placeholder-urls': 'error',
    },
  },
  {
    // Profile directories - minimal validation (authors, newsletters, pages, podcasts, tweets)
    files: profileIgnores,
    plugins: { markdown, frontmatter },
    language: 'markdown/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: {
      ...baseMarkdownRules,
      'frontmatter/valid-url': 'error',
      'frontmatter/no-placeholder-urls': 'error',
    },
  },
  {
    // Profiles that reference authors need validation
    files: ['content/newsletters/**/*.md', 'content/podcasts/**/*.md', 'content/tweets/**/*.md'],
    rules: {
      'frontmatter/valid-author-refs': 'error',
    },
  },
  {
    // Other markdown files (README, etc.)
    files: ['**/*.md'],
    ignores: ['content/**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    rules: {
      ...baseMarkdownRules,
      'markdown/require-alt-text': 'warn',
    },
  },
);
