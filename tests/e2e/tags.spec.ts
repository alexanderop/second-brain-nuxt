import { expect, test } from '@playwright/test'
import { TagsPage } from './pages/TagsPage'
import { TagDetailPage } from './pages/TagDetailPage'

test.describe('Tags', () => {
  test('tags index page loads with tag cloud', async ({ page }) => {
    const tagsPage = new TagsPage(page)
    await tagsPage.goto()

    await expect(tagsPage.heading).toBeVisible()

    const tagCount = await tagsPage.getTagCount()
    if (tagCount === 0) {
      await expect(tagsPage.emptyMessage).toBeVisible()
      return
    }
    expect(tagCount).toBeGreaterThan(0)
    await expect(tagsPage.firstTagLink).toBeVisible()
  })

  test('tags display count badges', async ({ page }) => {
    const tagsPage = new TagsPage(page)
    await tagsPage.goto()

    const tagCount = await tagsPage.getTagCount()
    if (tagCount === 0) {
      test.skip()
      return
    }

    // Each tag link should have a count badge (a span with a number)
    const firstTagText = await tagsPage.firstTagLink.textContent()
    // Tag links contain both the tag name and a count number
    expect(firstTagText).toMatch(/\d+/)
  })

  test('can navigate from tag to tag detail page', async ({ page }) => {
    const tagsPage = new TagsPage(page)
    await tagsPage.goto()

    const tagCount = await tagsPage.getTagCount()
    if (tagCount === 0) {
      test.skip()
      return
    }

    const href = await tagsPage.firstTagLink.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/tags/**'),
      tagsPage.firstTagLink.click(),
    ])

    await expect(page).toHaveURL(/\/tags\//)
  })

  test('tag detail page shows filtered content', async ({ page }) => {
    const tagsPage = new TagsPage(page)
    await tagsPage.goto()

    const tagCount = await tagsPage.getTagCount()
    if (tagCount === 0) {
      test.skip()
      return
    }

    // Get the tag name before clicking
    const href = await tagsPage.firstTagLink.getAttribute('href')
    const tagName = href?.replace('/tags/', '') || ''

    await Promise.all([
      page.waitForURL(href || '/tags/**'),
      tagsPage.firstTagLink.click(),
    ])

    const tagDetailPage = new TagDetailPage(page)

    // Heading should contain the tag name
    await expect(tagDetailPage.heading).toContainText(tagName)
  })

  test('tag detail page shows correct item count', async ({ page }) => {
    const tagsPage = new TagsPage(page)
    await tagsPage.goto()

    const tagCount = await tagsPage.getTagCount()
    if (tagCount === 0) {
      test.skip()
      return
    }

    const href = await tagsPage.firstTagLink.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/tags/**'),
      tagsPage.firstTagLink.click(),
    ])

    const tagDetailPage = new TagDetailPage(page)

    // Item count should be displayed
    await expect(tagDetailPage.itemCount).toBeVisible()
    const countText = await tagDetailPage.itemCount.textContent()
    // Count text should be in format "(N)"
    expect(countText).toMatch(/\(\d+\)/)
  })
})
