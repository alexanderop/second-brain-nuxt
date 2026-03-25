// Regex patterns for content transformation
const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const EXCALIDRAW_EMBED_REGEX = /!\[\[([^\]]+\.excalidraw(?:\.md)?)\]\]/g;

/**
 * Generate a URL-friendly slug from Excalidraw filename
 */
export function slugifyExcalidraw(filename: string): string {
  return filename
    .replace(/\.excalidraw(?:\.md)?$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Transform wiki-links and Excalidraw embeds
 */
export function transformWikiLinks(content: string): string {
  // Transform Excalidraw embeds first
  let result = content.replace(EXCALIDRAW_EMBED_REGEX, (_, filename: string) => {
    const slug = slugifyExcalidraw(filename);
    return `![${filename}](/excalidraw/${slug}.svg){.excalidraw-diagram}`;
  });

  // Transform regular wiki-links
  result = result.replace(WIKI_LINK_REGEX, (_, slug: string, displayText?: string) => {
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const text = displayText?.trim() ?? slug.trim();
    return `[${text}](/${normalizedSlug}){.wiki-link}`;
  });

  return result;
}
