// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/ui', '@nuxt/fonts', '@vueuse/nuxt', './modules/wikilinks'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  // Reduce file watchers to prevent EMFILE errors
  vite: {
    server: {
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**'],
      },
    },
  },

  css: ['~/assets/css/main.css'],

  // Required for Vercel serverless deployment
  content: {
    database: {
      type: 'sqlite',
      filename: ':memory:',
    },
    // Use Node.js built-in SQLite (v22.5.0+) to avoid better-sqlite3 native bindings
    experimental: {
      sqliteConnector: 'native',
    },
  },

  // Pre-render content pages to avoid cold start delays
  routeRules: {
    '/**': { prerender: true },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/api/graph', '/api/backlinks'],
      failOnError: false, // Continue on prerender errors to see what fails
    },
  },

  fonts: {
    families: [
      { name: 'Geist', provider: 'fontsource' },
      { name: 'Geist Mono', provider: 'fontsource' },
    ],
  },

  app: {
    head: {
      title: 'Second Brain',
      meta: [
        { name: 'description', content: 'Personal knowledge base with connected notes' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
    },
  },
})
