import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import markdown from '@eslint/markdown'
import frontmatter from './eslint-plugin-frontmatter/index.ts'

// Minimal ESLint config for rules oxlint doesn't support
// Main linting is done by oxlint (faster)
export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
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
      // Cyclomatic complexity - fail build if function exceeds threshold
      'complexity': ['error', 10],
      // Block reactive() in favor of ref() - oxlint doesn't support this
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'vue',
          importNames: ['reactive'],
          message: 'Use ref() instead of reactive() for consistent reactivity patterns.',
        }],
      }],
      // Ban else blocks - use early return or ternary instead
      'no-restricted-syntax': ['error', {
        selector: 'IfStatement > .alternate',
        message: 'Use early return or ternary instead of else.',
      }],
      // Forbid `as` type assertions - use type guards with Zod instead
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
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
      'vue': vuePlugin,
      'vuejs-accessibility': vuejsAccessibility,
    },
    rules: {
      // Limit template nesting depth for maintainability
      'vue/max-template-depth': ['error', { maxDepth: 10 }],
      // Limit props count - use objects for complex prop sets
      'vue/max-props': ['error', { maxProps: 6 }],
      // Cyclomatic complexity - fail build if function exceeds threshold
      'complexity': ['error', 10],
      // Block reactive() in favor of ref() - oxlint doesn't support this
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'vue',
          importNames: ['reactive'],
          message: 'Use ref() instead of reactive() for consistent reactivity patterns.',
        }],
      }],
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
      'no-restricted-syntax': ['error', {
        selector: 'IfStatement > .alternate',
        message: 'Use early return or ternary instead of else.',
      }],
      // Forbid `as` type assertions - use type guards with Zod instead
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
    },
  },
  {
    // Allow reactive() in stores
    files: ['**/stores/**'],
    rules: {
      'no-restricted-imports': 'off',
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
    // Markdown linting for content files
    files: ['content/**/*.md'],
    ignores: ['content/authors/**/*.md', 'content/pages/**/*.md', 'content/podcasts/**/*.md'],
    plugins: { markdown, frontmatter },
    language: 'markdown/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: {
      // @eslint/markdown rules
      'markdown/fenced-code-language': 'warn',
      'markdown/heading-increment': 'error',
      'markdown/no-empty-links': 'error',
      // Disabled: [[wikilinks]] are transformed by modules/wikilinks.ts
      'markdown/no-missing-label-refs': 'off',
      'markdown/require-alt-text': 'warn',
      // Frontmatter validation rules
      'frontmatter/valid-url': 'error',
      'frontmatter/valid-author-refs': 'error',
      'frontmatter/valid-wiki-links': 'warn',
      'frontmatter/valid-tag-format': 'warn',
      'frontmatter/required-fields': 'error',
      'frontmatter/no-duplicate-tags': 'warn',
      'frontmatter/valid-rating': 'error',
      'frontmatter/no-placeholder-urls': 'error',
    },
  },
  {
    // Author profiles - skip author validation (they define authors, not reference them)
    files: ['content/authors/**/*.md'],
    plugins: { markdown, frontmatter },
    language: 'markdown/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: {
      'markdown/fenced-code-language': 'warn',
      'markdown/heading-increment': 'error',
      'markdown/no-empty-links': 'error',
      'markdown/no-missing-label-refs': 'off',
      'frontmatter/valid-url': 'error',
      'frontmatter/no-placeholder-urls': 'error',
    },
  },
  {
    // Other markdown files (README, etc.)
    files: ['**/*.md'],
    ignores: ['content/**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    rules: {
      'markdown/fenced-code-language': 'warn',
      'markdown/heading-increment': 'error',
      'markdown/no-empty-links': 'error',
      'markdown/require-alt-text': 'warn',
    },
  },
)
