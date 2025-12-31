// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/ui', '@nuxt/fonts', '@vueuse/nuxt', './modules/wikilinks'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  css: ['~/assets/css/main.css'],

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
      ],
    },
  },
})
