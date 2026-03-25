import { mountSuspended } from '@nuxt/test-utils/runtime';
/**
 * Component-level accessibility tests using axe-core
 *
 * Mounts each component with minimal required props, clones DOM into
 * an isolated container, and runs axe.run() with page-level rules disabled.
 *
 * Skipped components (see test/unit/a11y-coverage.spec.ts for enforcement):
 * - BaseGraph, KnowledgeGraph, NoteGraph: D3/SVG canvas
 * - Mermaid: external library rendering
 * - ChatPanel, ChatMessage, ToolCallItem: complex async + injection deps
 * - AppSearchModal, AppShortcutsModal, AuthorPickerModal: require Teleport/portal
 * - GraphNodePanel, GraphFilters: require graph context
 * - ContentTable, ContentTableFiltersBar: complex table state
 * - ProseA: content component, minimal
 */
import { describe, it, expect } from 'vitest';

import AppFooter from '~/components/AppFooter.vue';
import AppHeader from '~/components/AppHeader.vue';
import BaseRatingDisplay from '~/components/BaseRatingDisplay.vue';
import BaseTagPill from '~/components/BaseTagPill.vue';
import BaseTypeIcon from '~/components/BaseTypeIcon.vue';
import BookCover from '~/components/BookCover.vue';
import ContentBacklinksSection from '~/components/ContentBacklinksSection.vue';
// Components
import ContentCard from '~/components/ContentCard.vue';
import ContentHeader from '~/components/ContentHeader.vue';
import ContentList from '~/components/ContentList.vue';
import Feature from '~/components/Feature.vue';
import GitHubRepoCard from '~/components/GitHubRepoCard.vue';
import NewsletterCard from '~/components/NewsletterCard.vue';
import NewsletterHeader from '~/components/NewsletterHeader.vue';
import PodcastCard from '~/components/PodcastCard.vue';
import PodcastHeader from '~/components/PodcastHeader.vue';
import StatCard from '~/components/StatCard.vue';
import TweetCard from '~/components/TweetCard.vue';
import TweetHeader from '~/components/TweetHeader.vue';
import YouTubePlayer from '~/components/YouTubePlayer.vue';

import { axe } from '../test-utils/a11y';

// Axe rules disabled for isolated component testing (page-level rules)
const AXE_RULE_OVERRIDES = {
  rules: {
    'landmark-one-main': { enabled: false },
    region: { enabled: false },
    'page-has-heading-one': { enabled: false },
    'landmark-no-duplicate-banner': { enabled: false },
    'landmark-no-duplicate-contentinfo': { enabled: false },
    'landmark-no-duplicate-main': { enabled: false },
  },
};

// Minimal fixtures for component props
const contentItem = {
  slug: 'test-note',
  title: 'Test Note',
  type: 'book' as const,
  tags: ['testing'],
  date: '2024-01-01',
  summary: 'A test note for accessibility testing',
  rating: 4,
};

const podcastItem = {
  name: 'Test Podcast',
  slug: 'test-podcast',
  description: 'A test podcast',
  hosts: ['host-1'],
};

const newsletterItem = {
  name: 'Test Newsletter',
  slug: 'test-newsletter',
  description: 'A test newsletter',
  authors: ['author-1'],
};

const tweetItem = {
  slug: 'test-tweet',
  type: 'tweet' as const,
  title: 'Test Tweet',
  tweetId: '123456',
  tweetUrl: 'https://x.com/test/status/123456',
  tweetText: 'This is a test tweet for accessibility',
  author: 'test-author',
  tweetedAt: '2024-01-01',
};

const tweetAuthor = {
  name: 'Test Author',
  slug: 'test-author',
  twitterHandle: 'testauthor',
};

const backlinks = [{ slug: 'linked-note', title: 'Linked Note', type: 'note' as const }];

/** Run axe on a mounted component's DOM */
async function checkA11y(component: Awaited<ReturnType<typeof mountSuspended>>) {
  const results = await axe(component.element, AXE_RULE_OVERRIDES);
  expect(results).toHaveNoViolations();
}

describe('Component Accessibility', () => {
  it('ContentCard has no a11y violations', async () => {
    const wrapper = await mountSuspended(ContentCard, {
      props: { content: contentItem },
    });
    await checkA11y(wrapper);
  });

  it('ContentHeader has no a11y violations', async () => {
    const wrapper = await mountSuspended(ContentHeader, {
      props: { content: contentItem },
    });
    await checkA11y(wrapper);
  });

  it('ContentList has no a11y violations', async () => {
    const wrapper = await mountSuspended(ContentList, {
      props: { items: [contentItem] },
    });
    await checkA11y(wrapper);
  });

  it('BookCover has no a11y violations', async () => {
    const wrapper = await mountSuspended(BookCover, {
      props: { cover: '/test-cover.jpg' },
    });
    await checkA11y(wrapper);
  });

  it('BaseTagPill has no a11y violations', async () => {
    const wrapper = await mountSuspended(BaseTagPill, {
      props: { tag: 'accessibility' },
    });
    await checkA11y(wrapper);
  });

  it('BaseTypeIcon has no a11y violations', async () => {
    const wrapper = await mountSuspended(BaseTypeIcon, {
      props: { type: 'book' },
    });
    await checkA11y(wrapper);
  });

  it('BaseRatingDisplay has no a11y violations', async () => {
    const wrapper = await mountSuspended(BaseRatingDisplay, {
      props: { rating: 4 },
    });
    await checkA11y(wrapper);
  });

  it('AppFooter has no a11y violations', async () => {
    const wrapper = await mountSuspended(AppFooter);
    await checkA11y(wrapper);
  });

  it('AppHeader has no a11y violations', async () => {
    const wrapper = await mountSuspended(AppHeader);
    await checkA11y(wrapper);
  });

  it('PodcastCard has no a11y violations', async () => {
    const wrapper = await mountSuspended(PodcastCard, {
      props: { podcast: podcastItem, episodeCount: 5 },
    });
    await checkA11y(wrapper);
  });

  it('PodcastHeader has no a11y violations', async () => {
    const wrapper = await mountSuspended(PodcastHeader, {
      props: {
        podcast: podcastItem,
        hosts: [{ slug: 'host-1', name: 'Test Host' }],
      },
    });
    await checkA11y(wrapper);
  });

  it('NewsletterCard has no a11y violations', async () => {
    const wrapper = await mountSuspended(NewsletterCard, {
      props: { newsletter: newsletterItem },
    });
    await checkA11y(wrapper);
  });

  it('NewsletterHeader has no a11y violations', async () => {
    const wrapper = await mountSuspended(NewsletterHeader, {
      props: { newsletter: newsletterItem },
    });
    await checkA11y(wrapper);
  });

  it('TweetCard has no a11y violations', async () => {
    const wrapper = await mountSuspended(TweetCard, {
      props: { tweet: tweetItem, author: tweetAuthor },
    });
    await checkA11y(wrapper);
  });

  it('TweetHeader has no a11y violations', async () => {
    const wrapper = await mountSuspended(TweetHeader, {
      props: { tweet: tweetItem, author: tweetAuthor },
    });
    await checkA11y(wrapper);
  });

  it('GitHubRepoCard has no a11y violations', async () => {
    const wrapper = await mountSuspended(GitHubRepoCard, {
      props: { url: 'https://github.com/test/repo' },
    });
    await checkA11y(wrapper);
  });

  it('Feature has no a11y violations', async () => {
    const wrapper = await mountSuspended(Feature, {
      props: { name: 'chat' },
      slots: { default: '<div>Feature content</div>' },
    });
    await checkA11y(wrapper);
  });

  it('YouTubePlayer has no a11y violations', async () => {
    const wrapper = await mountSuspended(YouTubePlayer, {
      props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });
    await checkA11y(wrapper);
  });

  it('StatCard has no a11y violations', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { label: 'Total Notes', value: '42' },
    });
    await checkA11y(wrapper);
  });

  it('ContentBacklinksSection has no a11y violations', async () => {
    const wrapper = await mountSuspended(ContentBacklinksSection, {
      props: { backlinks },
    });
    await checkA11y(wrapper);
  });
});
