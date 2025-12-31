import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,
  typescript: {
    overrides: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    },
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'vue',
        importNames: ['reactive'],
        message: 'Use ref() instead of reactive() for consistent reactivity patterns.',
      }],
    }],
  },
}, {
  // Relaxed rules for tests
  files: ['**/__tests__/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}, {
  // Allow reactive() in stores
  files: ['**/stores/**'],
  rules: {
    'no-restricted-imports': 'off',
  },
})
