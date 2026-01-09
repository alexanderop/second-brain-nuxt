import { siteConfig } from '~~/site.config'

/**
 * Provides reactive access to site configuration
 * Use this in components to access site name, nav, etc.
 */
export function useSiteConfig() {
  return siteConfig
}
