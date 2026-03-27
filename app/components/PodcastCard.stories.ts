import type { Meta, StoryObj } from "@storybook/vue3";
import PodcastCard from "./PodcastCard.vue";
import type { PodcastItem } from "~/types/content";

const samplePodcast: PodcastItem = {
  name: "Syntax.fm",
  slug: "syntax-fm",
  description: "A Tasty Treats Podcast for Web Developers",
  artwork: "https://placehold.co/128x128?text=Syntax",
  hosts: ["Wes Bos", "Scott Tolinski"],
};

const meta = {
  title: "Content/PodcastCard",
  component: PodcastCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PodcastCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    podcast: samplePodcast,
    episodeCount: 42,
  },
};

export const SingleEpisode: Story = {
  args: {
    podcast: { ...samplePodcast, name: "New Show" },
    episodeCount: 1,
  },
};

export const NoArtwork: Story = {
  args: {
    podcast: { ...samplePodcast, artwork: undefined },
    episodeCount: 15,
  },
};

export const ManyEpisodes: Story = {
  args: {
    podcast: {
      ...samplePodcast,
      name: "The Changelog",
      slug: "the-changelog",
    },
    episodeCount: 573,
  },
};
