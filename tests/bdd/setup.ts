/**
 * BDD Test Setup
 *
 * Configures Happy DOM environment with:
 * - Real Nuxt UI components via vue-plugin
 * - Tailwind CSS styles
 * - Global test utilities
 */
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Import CSS for styling (Tailwind + Nuxt UI)
import '~/assets/css/main.css'

// Configure Vue Test Utils defaults
config.global.stubs = {
  // Stub components that require Nuxt Content runtime
  ContentRenderer: {
    template: '<div class="content-renderer"><slot /></div>',
    props: ['value'],
  },
  // Stub PWA component
  VitePwaManifest: { template: '<div />' },
  // Stub route announcer
  NuxtRouteAnnouncer: { template: '<div />' },
}

// Make vi available globally for tests
globalThis.vi = vi
