import { parse as parseYaml } from 'yaml'
import type { FrontmatterData, YamlNode } from './types.ts'

/**
 * Parse YAML frontmatter from an ESLint markdown AST node
 * Returns null if parsing fails (invalid YAML)
 */
export function parseFrontmatter(node: YamlNode): FrontmatterData | null {
  try {
    const data = parseYaml(node.value)
    if (!data || typeof data !== 'object') {
      return null
    }
    return data
  }
  catch {
    return null
  }
}

type UrlResult = { field: string, value: string }

function extractTopLevelUrls(data: FrontmatterData, urlFields: string[]): UrlResult[] {
  const results: UrlResult[] = []
  for (const field of urlFields) {
    const value = data[field]
    if (typeof value === 'string' && value.trim()) {
      results.push({ field, value })
    }
  }
  return results
}

function extractPlatformUrls(platforms: Record<string, string> | undefined): UrlResult[] {
  if (!platforms || typeof platforms !== 'object') return []

  const results: UrlResult[] = []
  for (const [key, value] of Object.entries(platforms)) {
    if (typeof value === 'string' && value.trim()) {
      results.push({ field: `platforms.${key}`, value })
    }
  }
  return results
}

function extractUrlsArray(urls: Array<{ platform: string, url: string }> | undefined): UrlResult[] {
  if (!Array.isArray(urls)) return []

  const results: UrlResult[] = []
  for (let i = 0; i < urls.length; i++) {
    const item = urls[i]
    if (item && typeof item.url === 'string') {
      results.push({ field: `urls[${i}].url`, value: item.url })
    }
  }
  return results
}

/**
 * Extract all URL fields from frontmatter data
 * Returns array of { field, value } for each URL field found
 */
export function extractUrlFields(
  data: FrontmatterData,
  urlFields: string[] = ['url', 'cover', 'website', 'tweetUrl', 'feed', 'artwork'],
): UrlResult[] {
  return [
    ...extractTopLevelUrls(data, urlFields),
    ...extractPlatformUrls(data.platforms),
    ...extractUrlsArray(data.urls),
  ]
}
