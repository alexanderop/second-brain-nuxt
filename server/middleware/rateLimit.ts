import { defineEventHandler, createError, getRequestHeader, getRequestURL, setResponseHeader } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10
const CLEANUP_INTERVAL_MS = 5 * 60_000 // Clean up every 5 minutes

const rateLimitMap = new Map<string, RateLimitEntry>()

// Periodically clean up stale entries
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupTimer() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt <= now) {
        rateLimitMap.delete(key)
      }
    }
    // Stop the timer if map is empty to avoid keeping the process alive
    if (rateLimitMap.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }, CLEANUP_INTERVAL_MS)
  // Allow the process to exit even if the timer is running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Only rate limit the chat endpoint
  if (!url.pathname.startsWith('/api/chat')) {
    return
  }

  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || entry.resetAt <= now) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    ensureCleanupTimer()
    return
  }

  // Within current window
  entry.count++

  if (entry.count > MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    setResponseHeader(event, 'Retry-After', retryAfterSeconds)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: { message: `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.` },
    })
  }
})
