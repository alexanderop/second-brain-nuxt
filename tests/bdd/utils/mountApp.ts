/**
 * Mount App Helper
 *
 * Provides utilities to mount the full test app with mocked data.
 * Handles async component setup and provides test fixtures.
 */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { vi } from 'vitest'
import TestApp from '../TestApp.vue'
import { createTestRouter } from '../router'
import {
  queryCollection,
  queryCollectionSearchSections,
  setMockRoute,
  navigateTo,
} from '../mocks/imports'

// ============================================
// Types
// ============================================

export interface MockContent {
  id: string
  title: string
  stem: string
  body?: string
  type?: string
  description?: string
}

export interface MockSearchSection {
  id: string
  title: string
  titles?: string[]
  content?: string
  level?: number
}

export interface MockAuthor {
  name: string
  slug: string
  avatar?: string
}

export interface MockPodcast {
  name: string
  slug: string
  artwork?: string
}

export interface MockNewsletter {
  name: string
  slug: string
  logo?: string
}

export interface MountAppOptions {
  /** Initial route path */
  route?: string
  /** Mock content for pages */
  content?: MockContent[]
  /** Mock search sections for search modal */
  searchSections?: MockSearchSection[]
  /** Mock authors */
  authors?: MockAuthor[]
  /** Mock podcasts */
  podcasts?: MockPodcast[]
  /** Mock newsletters */
  newsletters?: MockNewsletter[]
}

// ============================================
// Mount Helper
// ============================================

/**
 * Mount the full test app with mocked data
 */
export async function mountApp(options: MountAppOptions = {}) {
  const {
    route = '/',
    content = [],
    searchSections = [],
    authors = [],
    podcasts = [],
    newsletters = [],
  } = options

  // Setup mock route
  setMockRoute({
    path: route,
    fullPath: route,
    params: {},
    query: {},
  })

  // Setup queryCollectionSearchSections mock
  ;(queryCollectionSearchSections as ReturnType<typeof vi.fn>).mockResolvedValue(searchSections)

  // Setup queryCollection mock with chainable builder
  const createMockBuilder = (data: unknown[]) => ({
    path: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(data[0] ?? null),
    all: vi.fn().mockResolvedValue(data),
    count: vi.fn().mockResolvedValue(data.length),
  })

  ;(queryCollection as ReturnType<typeof vi.fn>).mockImplementation((collection: string) => {
    switch (collection) {
      case 'content':
        return createMockBuilder(content)
      case 'authors':
        return createMockBuilder(authors)
      case 'podcasts':
        return createMockBuilder(podcasts)
      case 'newsletters':
        return createMockBuilder(newsletters)
      default:
        return createMockBuilder([])
    }
  })

  // Don't override useAsyncData - let the default mock in imports.ts handle it
  // The default mock properly returns Vue refs

  // Create router
  const router = createTestRouter(route)

  // Mount the app
  const wrapper = mount(TestApp, {
    global: {
      plugins: [router],
      stubs: {
        // Stub Nuxt-specific components
        VitePwaManifest: { template: '<div />' },
        NuxtRouteAnnouncer: { template: '<div />' },
        ContentRenderer: {
          template: '<div class="content-renderer"><slot /></div>',
          props: ['value'],
        },
        // Stub async components to avoid Suspense warnings
        AppSearchModal: {
          template: '<div data-testid="search-modal-stub" />',
          props: ['open'],
        },
        AppShortcutsModal: {
          template: '<div data-testid="shortcuts-modal-stub" />',
          props: ['open'],
        },
        // Stub icon components
        BaseTypeIcon: {
          template: '<span class="type-icon" />',
          props: ['type', 'size'],
        },
      },
    },
  })

  // Wait for router and async operations
  await router.isReady()
  await flushPromises()
  await nextTick()

  return {
    wrapper,
    router,
    // Expose mocks for assertions
    mocks: {
      navigateTo: navigateTo as ReturnType<typeof vi.fn>,
      queryCollection: queryCollection as ReturnType<typeof vi.fn>,
      queryCollectionSearchSections: queryCollectionSearchSections as ReturnType<typeof vi.fn>,
    },
  }
}

// ============================================
// Test Utilities
// ============================================

/**
 * Wait for component to settle after interactions
 */
export async function waitForUpdate(_wrapper: VueWrapper) {
  await flushPromises()
  await nextTick()
}

/**
 * Find element by test ID
 */
export function findByTestId(wrapper: VueWrapper, testId: string) {
  return wrapper.find(`[data-testid="${testId}"]`)
}

/**
 * Find all elements by test ID
 */
export function findAllByTestId(wrapper: VueWrapper, testId: string) {
  return wrapper.findAll(`[data-testid="${testId}"]`)
}
