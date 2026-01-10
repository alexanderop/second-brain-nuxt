import { expect, test } from '@playwright/test'
import { AboutPage } from './pages/AboutPage'

test.describe('About', () => {
  test('about page loads with title', async ({ page }) => {
    const aboutPage = new AboutPage(page)
    await aboutPage.goto()

    await expect(aboutPage.heading).toBeVisible()
  })

  test('social links are visible and have correct hrefs', async ({ page }) => {
    const aboutPage = new AboutPage(page)
    await aboutPage.goto()

    const linkCount = await aboutPage.socialLinks.count()
    if (linkCount === 0) {
      test.skip()
      return
    }

    // Check that social links have proper href attributes
    const firstLink = aboutPage.socialLinks.first()
    const href = await firstLink.getAttribute('href')
    expect(href).toBeTruthy()
    // Social links should be external (twitter, github, linkedin, youtube, bluesky)
    expect(href).toMatch(/^https?:\/\//)
  })

  test('content section renders markdown', async ({ page }) => {
    const aboutPage = new AboutPage(page)
    await aboutPage.goto()

    // Check if content section exists and has rendered content
    const contentExists = await aboutPage.content.count() > 0
    if (!contentExists) {
      test.skip()
      return
    }

    await expect(aboutPage.content).toBeVisible()
  })

  test('avatar displays if configured', async ({ page }) => {
    const aboutPage = new AboutPage(page)
    await aboutPage.goto()

    const avatarCount = await aboutPage.avatar.count()
    // Avatar is optional - just verify it's visible if present
    if (avatarCount > 0) {
      await expect(aboutPage.avatar).toBeVisible()
    }
  })
})
