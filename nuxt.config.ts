import { siteConfig } from "./config/site";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/fonts",
    "@vueuse/nuxt",
    "@vite-pwa/nuxt",
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxtjs/html-validator",
    "./modules/wiki-links",
  ],

  devtools: { enabled: true },

  // Configure Nuxt UI theme colors - enables semantic color aliases for components
  ui: {
    theme: {
      colors: ["primary", "secondary", "success", "info", "warning", "error", "neutral"],
    },
  },

  htmlValidator: {
    enabled: process.env.NODE_ENV !== "test",
    options: {
      rules: {
        "meta-refresh": "off",
        "prefer-native-element": "off",
        "element-permitted-content": "off",
      },
    },
    failOnError: true,
  },

  compatibilityDate: "2025-11-01",

  // Prefetch route components on hover/focus for faster navigation
  experimental: {
    typescriptPlugin: true,
    typedPages: true,
    defaults: {
      nuxtLink: {
        prefetchOn: { interaction: true },
      },
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        noUnusedLocals: true,
      },
    },
  },

  runtimeConfig: {
    anthropicApiKey: "", // Set via NUXT_ANTHROPIC_API_KEY
    public: {
      siteUrl: siteConfig.url,
    },
  },

  // Disable all auto-imports
  imports: {
    autoImport: false,
  },
  components: {
    dirs: [{ path: "~/components/content", prefix: "", global: true }],
  },

  // Required for custom MDC components to work in static generation
  build: {
    transpile: ["@nuxt/content"],
  },

  // Reduce file watchers to prevent EMFILE errors
  vite: {
    optimizeDeps: {
      include: ["@vueuse/core", "d3", "fuse.js", "mermaid", "zod"],
      exclude: ["@nuxtjs/mdc"],
    },
    server: {
      watch: {
        usePolling: false,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.nuxt/**"],
      },
    },
  },

  css: ["~/assets/css/main.css"],

  // Required for Vercel serverless deployment
  content: {
    database: {
      type: "sqlite",
      filename: ":memory:",
    },
    // Use Node.js built-in SQLite (v22.5.0+) to avoid better-sqlite3 native bindings
    experimental: {
      sqliteConnector: "native",
    },
    build: {
      markdown: {
        toc: {
          depth: 3, // Include h2, h3 headings
          searchDepth: 2,
        },
        highlight: {
          theme: {
            default: "github-light",
            dark: "night-owl",
          },
          langs: [
            "javascript",
            "typescript",
            "vue",
            "vue-html",
            "html",
            "css",
            "json",
            "yaml",
            "markdown",
            "mdc",
            "md",
            "bash",
            "shell",
            "python",
            "go",
            "rust",
            "sql",
            "graphql",
            "diff",
          ],
        },
      },
    },
  },

  // Pre-render content pages to avoid cold start delays
  routeRules: {
    "/**": { prerender: true },
    "/api/graph": { swr: 300 },
    "/api/backlinks": { swr: 300 },
    "/api/mentions": { swr: 300 },
    "/api/note-graph/**": { swr: 120 },
    "/api/stats": { swr: 600 },
  },

  nitro: {
    imports: {
      autoImport: false,
    },
    prerender: {
      crawlLinks: true,
      routes: ["/", "/api/graph", "/api/backlinks"],
      failOnError: false, // Continue on prerender errors to see what fails
      concurrency: 1,
      ignore: ["/tweets/tweets/"], // Exclude malformed tweet paths
    },
    esbuild: {
      options: {
        target: "es2024",
      },
    },
  },

  fonts: {
    families: [
      { name: "Geist", provider: "fontsource" },
      { name: "Geist Mono", provider: "fontsource" },
    ],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: siteConfig.name,
      meta: [
        { name: "description", content: siteConfig.description },
        {
          name: "robots",
          content: siteConfig.allowIndexing ? "index, follow" : "noindex, nofollow",
        },
        { name: "theme-color", content: siteConfig.themeColor },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", href: "/brain-icon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png", sizes: "180x180" },
      ],
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: siteConfig.name,
      short_name: siteConfig.shortName,
      description: siteConfig.description,
      theme_color: siteConfig.themeColor,
      background_color: siteConfig.themeColor,
      display: "standalone",
      icons: [
        {
          src: "pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      shortcuts: [
        {
          name: "Search",
          url: "/search",
          icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
        },
        {
          name: "Books",
          url: "/books",
          icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
        },
        {
          name: "Podcasts",
          url: "/podcasts",
          icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
        },
      ],
    },
    workbox: {
      // Only precache app shell (JS/CSS/fonts), not all HTML pages
      globPatterns: ["**/*.{js,css,woff2}"],
      globIgnores: ["**/_payload.json"],

      // Offline fallback page
      navigateFallback: "/offline",
      navigateFallbackDenylist: [/^\/api\//],

      // Runtime caching strategies
      runtimeCaching: [
        {
          // HTML pages: fresh when online, cached fallback offline
          urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
          handler: "NetworkFirst",
          options: {
            cacheName: "pages",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          // API routes: instant from cache, refresh in background
          urlPattern: /^\/api\//,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
          },
        },
        {
          // Images: cache first for speed
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
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
});
