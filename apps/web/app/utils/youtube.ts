/**
 * Extract YouTube video ID from various URL formats
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/v/VIDEO_ID
 * - URLs with additional parameters (e.g., ?v=VIDEO_ID&t=123)
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  const patterns = [
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URL: youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Old embed URL: youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Generate privacy-friendly embed URL using youtube-nocookie.com
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

/**
 * Generate thumbnail URL for facade pattern
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'hqdefault'
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
}
