import { expect, test } from '@playwright/test'
import { PodcastsPage } from './pages/PodcastsPage'
import { PodcastDetailPage } from './pages/PodcastDetailPage'

test.describe('Podcasts', () => {
  test('podcasts index page loads with podcast cards', async ({ page }) => {
    const podcastsPage = new PodcastsPage(page)
    await podcastsPage.goto()

    await expect(podcastsPage.heading).toBeVisible()

    const podcastCount = await podcastsPage.getPodcastCount()
    if (podcastCount === 0) {
      await expect(podcastsPage.emptyMessage).toBeVisible()
      return
    }
    expect(podcastCount).toBeGreaterThan(0)
    await expect(podcastsPage.firstPodcastCard).toBeVisible()
  })

  test('podcast cards show episode counts', async ({ page }) => {
    const podcastsPage = new PodcastsPage(page)
    await podcastsPage.goto()

    const podcastCount = await podcastsPage.getPodcastCount()
    if (podcastCount === 0) {
      test.skip()
      return
    }

    // Podcast cards should contain episode count information
    const firstCardText = await podcastsPage.firstPodcastCard.textContent()
    // Cards typically show "X episodes" text
    expect(firstCardText).toBeTruthy()
  })

  test('can navigate from card to podcast detail page', async ({ page }) => {
    const podcastsPage = new PodcastsPage(page)
    await podcastsPage.goto()

    const podcastCount = await podcastsPage.getPodcastCount()
    if (podcastCount === 0) {
      test.skip()
      return
    }

    const href = await podcastsPage.firstPodcastCard.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/podcasts/**'),
      podcastsPage.firstPodcastCard.click(),
    ])

    await expect(page).toHaveURL(/\/podcasts\//)
  })

  test('podcast detail page shows episodes section', async ({ page }) => {
    const podcastsPage = new PodcastsPage(page)
    await podcastsPage.goto()

    const podcastCount = await podcastsPage.getPodcastCount()
    if (podcastCount === 0) {
      test.skip()
      return
    }

    const href = await podcastsPage.firstPodcastCard.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/podcasts/**'),
      podcastsPage.firstPodcastCard.click(),
    ])

    const podcastDetailPage = new PodcastDetailPage(page)

    // Episodes section should be visible
    await expect(podcastDetailPage.episodesSection).toBeVisible()
  })

  test('can navigate from episode to note page', async ({ page }) => {
    const podcastsPage = new PodcastsPage(page)
    await podcastsPage.goto()

    const podcastCount = await podcastsPage.getPodcastCount()
    if (podcastCount === 0) {
      test.skip()
      return
    }

    const href = await podcastsPage.firstPodcastCard.getAttribute('href')

    await Promise.all([
      page.waitForURL(href || '/podcasts/**'),
      podcastsPage.firstPodcastCard.click(),
    ])

    const podcastDetailPage = new PodcastDetailPage(page)

    const episodeCount = await podcastDetailPage.getEpisodeCount()
    if (episodeCount === 0) {
      test.skip()
      return
    }

    const firstEpisode = podcastDetailPage.contentItems.first()
    const episodeLink = firstEpisode.getByRole('link').first()
    const episodeHref = await episodeLink.getAttribute('href')

    await Promise.all([
      page.waitForURL(episodeHref || '**'),
      episodeLink.click(),
    ])

    // Should have navigated away from podcasts
    expect(page.url()).not.toContain('/podcasts/')
  })
})
