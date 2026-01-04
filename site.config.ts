/**
 * Site Configuration
 *
 * This is the main configuration file for your Second Brain instance.
 * Customize these values to personalize your knowledge base.
 */

export const siteConfig = {
  /**
   * Site name displayed in header, page titles, and PWA manifest
   */
  name: 'Second Brain',

  /**
   * Short name for PWA (no spaces, used in app launcher)
   */
  shortName: 'SecondBrain',

  /**
   * Site description for SEO and PWA manifest
   */
  description: 'Personal knowledge base with connected notes',

  /**
   * Theme color used in browser chrome and PWA
   * Should be a valid hex color (e.g., '#1a1a2e')
   */
  themeColor: '#1a1a2e',

  /**
   * Set to true to allow search engines to index your site
   * Default is false for personal knowledge bases
   */
  allowIndexing: false,

  /**
   * Navigation links displayed in header
   * Each link requires: label, to (path), icon (Lucide icon class)
   */
  nav: [
    { label: 'Home', to: '/', icon: 'i-lucide-home' },
    { label: 'Table', to: '/table', icon: 'i-lucide-table-2' },
    { label: 'Books', to: '/books', icon: 'i-lucide-book-open' },
    { label: 'Podcasts', to: '/podcasts', icon: 'i-lucide-podcast' },
    { label: 'Newsletters', to: '/newsletters', icon: 'i-lucide-newspaper' },
    { label: 'Graph', to: '/graph', icon: 'i-lucide-network' },
    { label: 'Stats', to: '/stats', icon: 'i-lucide-bar-chart-2' },
    { label: 'Tags', to: '/tags', icon: 'i-lucide-tags' },
    { label: 'Authors', to: '/authors', icon: 'i-lucide-users' },
    { label: 'About', to: '/about', icon: 'i-lucide-user' },
  ],

  /**
   * Keyboard shortcuts for navigation
   * Format: 'key-sequence': '/path'
   * Use 'g-x' for two-key sequences (press G then X)
   */
  shortcuts: {
    navigation: [
      { keys: ['G', 'H'], to: '/', description: 'Go to home' },
      { keys: ['G', 'B'], to: '/books', description: 'Go to books' },
      { keys: ['G', 'P'], to: '/podcasts', description: 'Go to podcasts' },
      { keys: ['G', 'N'], to: '/newsletters', description: 'Go to newsletters' },
      { keys: ['G', 'G'], to: '/graph', description: 'Go to graph' },
      { keys: ['G', 'T'], to: '/tags', description: 'Go to tags' },
      { keys: ['G', 'A'], to: '/authors', description: 'Go to authors' },
    ],
    actions: [
      { keys: ['J'], description: 'Next item' },
      { keys: ['K'], description: 'Previous item' },
      { keys: ['Enter'], description: 'Open selected' },
    ],
    general: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['meta', 'K'], description: 'Open search' },
      { keys: ['Esc'], description: 'Close modal / go back' },
    ],
  },

  /**
   * Social/external links (optional)
   * Used in footer or about page
   */
  social: {
    github: '',
    twitter: '',
  },
} as const

// Type exports for use in components
export type SiteConfig = typeof siteConfig
export type NavItem = (typeof siteConfig.nav)[number]
export type ShortcutCategory = keyof typeof siteConfig.shortcuts
