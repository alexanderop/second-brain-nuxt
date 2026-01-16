import { siteConfig } from './site.config'

// Regex patterns for content transformation
const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
const EXCALIDRAW_EMBED_REGEX = /!\[\[([^\]]+\.excalidraw(?:\.md)?)\]\]/g

/**
 * Generate a URL-friendly slug from Excalidraw filename
 */
function slugifyExcalidraw(filename: string): string {
  return filename
    .replace(/\.excalidraw(?:\.md)?$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

/**
 * Transform wiki-links and Excalidraw embeds
 */
function transformWikiLinks(content: string): string {
  // Transform Excalidraw embeds first
  let result = content.replace(EXCALIDRAW_EMBED_REGEX, (_, filename: string) => {
    const slug = slugifyExcalidraw(filename)
    return `![${filename}](/excalidraw/${slug}.svg){.excalidraw-diagram}`
  })

  // Transform regular wiki-links
  result = result.replace(WIKI_LINK_REGEX, (_, slug: string, displayText?: string) => {
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-')
    const text = displayText?.trim() ?? slug.trim()
    return `[${text}](/${normalizedSlug}){.wiki-link}`
  })

  return result
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/fonts', '@vueuse/nuxt', '@vite-pwa/nuxt', '@nuxt/a11y', '@nuxt/content'],

  devtools: { enabled: true },

  // Configure Nuxt UI theme colors - enables semantic color aliases for components
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'],
    },
  },

  // Content transformation hooks - must be at config level per Nuxt Content v3 docs
  hooks: {
    'content:file:beforeParse'(ctx: { file: { id?: string, body: string } }) {
      if (ctx.file?.id?.endsWith('.md') && typeof ctx.file.body === 'string') {
        // Transform wiki-links and Excalidraw embeds
        ctx.file.body = transformWikiLinks(ctx.file.body)
      }
    },
  },
  compatibilityDate: '2024-04-03',

  // Prefetch route components on hover/focus for faster navigation
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: { interaction: true },
      },
    },
  },

  runtimeConfig: {
    anthropicApiKey: '', // Set via NUXT_ANTHROPIC_API_KEY
    public: {
      siteUrl: siteConfig.url,
    },
  },

  // Disable all auto-imports
  imports: {
    autoImport: false,
  },
  components: {
    dirs: [
      { path: '~/components/content', prefix: '', global: true },
    ],
  },

  // Required for custom MDC components to work in static generation
  build: {
    transpile: ['@nuxt/content'],
  },

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
    build: {
      markdown: {
        toc: {
          depth: 3, // Include h2, h3 headings
          searchDepth: 2,
        },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'night-owl',
          },
          langs: [
            'javascript',
            'typescript',
            'vue',
            'vue-html',
            'html',
            'css',
            'json',
            'yaml',
            'markdown',
            'mdc',
            'md',
            'bash',
            'shell',
            'python',
            'go',
            'rust',
            'sql',
            'graphql',
            'diff',
          ],
        },
      },
    },
  },

  // Pre-render content pages to avoid cold start delays
  routeRules: {
    '/**': { prerender: true },
  },

  nitro: {
    imports: {
      autoImport: false,
    },
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
      htmlAttrs: {
        lang: 'en',
      },
      title: siteConfig.name,
      meta: [
        { name: 'description', content: siteConfig.description },
        { name: 'robots', content: siteConfig.allowIndexing ? 'index, follow' : 'noindex, nofollow' },
        { name: 'theme-color', content: siteConfig.themeColor },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/brain-icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png', sizes: '180x180' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: siteConfig.name,
      short_name: siteConfig.shortName,
      description: siteConfig.description,
      theme_color: siteConfig.themeColor,
      background_color: siteConfig.themeColor,
      display: 'standalone',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      shortcuts: [
        {
          name: 'Search',
          url: '/search',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Books',
          url: '/books',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Podcasts',
          url: '/podcasts',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
      ],
    },
    workbox: {
      // Only precache app shell (JS/CSS/fonts), not all HTML pages
      globPatterns: ['**/*.{js,css,woff2}'],
      globIgnores: ['**/_payload.json'],

      // Offline fallback page
      navigateFallback: '/offline',
      navigateFallbackDenylist: [/^\/api\//],

      // Runtime caching strategies
      runtimeCaching: [
        {
          // HTML pages: fresh when online, cached fallback offline
          urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          // API routes: instant from cache, refresh in background
          urlPattern: /^\/api\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
          },
        },
        {
          // Images: cache first for speed
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
})
