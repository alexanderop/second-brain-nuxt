import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import markdown from '@eslint/markdown'

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
    rules: {
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
      'vuejs-accessibility': vuejsAccessibility,
    },
    rules: {
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
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: {
      'markdown/fenced-code-language': 'warn',
      'markdown/heading-increment': 'error',
      'markdown/no-empty-links': 'error',
      // Disabled: [[wikilinks]] are transformed by modules/wikilinks.ts
      'markdown/no-missing-label-refs': 'off',
      'markdown/require-alt-text': 'warn',
    },
  },
)
