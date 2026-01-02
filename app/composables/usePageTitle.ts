import { useSeoMeta } from '#imports'
import { siteConfig } from '~~/site.config'

/**
 * Sets a consistent page title with the site name suffix
 *
 * @param title - The page-specific title (string) or a getter function for reactive titles
 *
 * @example
 * // Static title:
 * usePageTitle('Tags')
 * // Results in: "Tags - Second Brain"
 *
 * @example
 * // Reactive title (for dynamic pages):
 * usePageTitle(() => author.value?.name ?? 'Author')
 * // Results in: "John Doe - Second Brain" (reactive)
 *
 * @example
 * // For the home page (no prefix):
 * usePageTitle()
 * // Results in: "Second Brain"
 */
export function usePageTitle(title?: string | (() => string)) {
  if (typeof title === 'function') {
    // Reactive title - use getter
    useSeoMeta({
      title: () => {
        const t = title()
        return t ? `${t} - ${siteConfig.name}` : siteConfig.name
      },
    })
    return
  }

  // Static title
  const fullTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.name
  useSeoMeta({
    title: fullTitle,
  })
}
