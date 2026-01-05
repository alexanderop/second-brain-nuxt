/**
 * Test Router Configuration
 *
 * Provides vue-router setup that mirrors Nuxt's file-based routing
 * for BDD tests. Only includes routes needed for testing.
 */
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'

// Simple placeholder component for routes we don't need to test deeply
const PlaceholderPage = defineComponent({
  name: 'PlaceholderPage',
  props: {
    name: { type: String, default: 'Page' },
  },
  setup(props) {
    return () => h('div', { 'data-testid': 'page', 'data-page': props.name }, props.name)
  },
})

// Lazy load actual pages when needed
const IndexPage = () => import('~/pages/index.vue')
const SlugPage = () => import('~/pages/[...slug].vue')

export function createTestRouter(_initialRoute = '/') {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'index',
        component: IndexPage,
      },
      {
        path: '/books',
        name: 'books',
        component: () => import('~/pages/books.vue'),
      },
      {
        path: '/graph',
        name: 'graph',
        component: PlaceholderPage,
        props: { name: 'Graph' },
      },
      {
        path: '/tags',
        name: 'tags',
        component: PlaceholderPage,
        props: { name: 'Tags' },
      },
      {
        path: '/authors',
        name: 'authors',
        component: PlaceholderPage,
        props: { name: 'Authors' },
      },
      {
        path: '/search',
        name: 'search',
        component: PlaceholderPage,
        props: { name: 'Search' },
      },
      // Catch-all for content pages
      {
        path: '/:slug(.*)*',
        name: 'slug',
        component: SlugPage,
      },
    ],
  })
}
