import { expect, test } from '@playwright/test'
import { NotePage } from './pages/NotePage'

test.describe('OG Image Generation', () => {
  test.describe('API Endpoint', () => {
    test('returns PNG image with correct content type', async ({ request }) => {
      const response = await request.get('/api/og/atomic-habits')

      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('image/png')
    })

    test('returns image with cache headers', async ({ request }) => {
      const response = await request.get('/api/og/atomic-habits')

      expect(response.headers()['cache-control']).toContain('max-age=31536000')
    })

    test('generates image for different content types', async ({ request }) => {
      // Test with a book
      const bookResponse = await request.get('/api/og/atomic-habits')
      expect(bookResponse.status()).toBe(200)
      expect(bookResponse.headers()['content-type']).toBe('image/png')

      // Test buffer is valid PNG (starts with PNG signature)
      const buffer = await bookResponse.body()
      expect(buffer.length).toBeGreaterThan(0)
      // PNG magic bytes: 0x89 0x50 0x4E 0x47
      expect(buffer[0]).toBe(0x89)
      expect(buffer[1]).toBe(0x50) // P
      expect(buffer[2]).toBe(0x4E) // N
      expect(buffer[3]).toBe(0x47) // G
    })

    test('handles non-existent content gracefully', async ({ request }) => {
      const response = await request.get('/api/og/non-existent-page-12345')

      // Should still return an image (with default values)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('image/png')
    })
  })

  test.describe('Meta Tags', () => {
    test('content page has OG image meta tag', async ({ page }) => {
      const notePage = new NotePage(page)
      await notePage.goto('atomic-habits')

      // Check og:image meta tag
      const ogImage = page.locator('meta[property="og:image"]')
      await expect(ogImage).toHaveAttribute('content', /\/api\/og\/atomic-habits/)
    })

    test('content page has Twitter card meta tags', async ({ page }) => {
      const notePage = new NotePage(page)
      await notePage.goto('atomic-habits')

      // Check twitter:card meta tag
      const twitterCard = page.locator('meta[name="twitter:card"]')
      await expect(twitterCard).toHaveAttribute('content', 'summary_large_image')

      // Check twitter:image meta tag
      const twitterImage = page.locator('meta[name="twitter:image"]')
      await expect(twitterImage).toHaveAttribute('content', /\/api\/og\/atomic-habits/)
    })

    test('content page has OG title and description', async ({ page }) => {
      const notePage = new NotePage(page)
      await notePage.goto('atomic-habits')

      // Check og:title exists
      const ogTitle = page.locator('meta[property="og:title"]')
      await expect(ogTitle).toHaveAttribute('content', /.+/)

      // Check og:description exists
      const ogDescription = page.locator('meta[property="og:description"]')
      await expect(ogDescription).toBeAttached()
    })
  })
})
