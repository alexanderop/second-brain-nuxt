import { siteConfig } from "~~/config/site";

/**
 * Provides reactive access to site configuration
 * Use this in components to access site name, nav, etc.
 */
export function useSiteConfig() {
  return siteConfig;
}
