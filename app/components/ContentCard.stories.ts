import type { Meta, StoryObj } from "@storybook/vue3";
import ContentCard from "./ContentCard.vue";
import type { ContentItem } from "~/types/content";

const baseItem: ContentItem = {
  slug: "example-article",
  title: "Understanding TypeScript Generics",
  type: "article",
  authors: ["John Doe"],
  date: "2025-01-15",
  summary: "A deep dive into TypeScript generics and how to use them effectively in real-world applications.",
  tags: ["typescript", "programming"],
  rating: 8,
};

const meta = {
  title: "Content/ContentCard",
  component: ContentCard,
  tags: ["autodocs"],
  argTypes: {
    selected: { control: "boolean" },
  },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Article: Story = {
  args: {
    content: baseItem,
  },
};

export const Podcast: Story = {
  args: {
    content: {
      ...baseItem,
      slug: "podcast-episode-1",
      title: "Deep Dive into Vue Reactivity",
      type: "podcast",
      podcast: "syntax-fm",
      guests: ["Evan You"],
      authors: undefined,
    },
    podcastName: "Syntax.fm",
  },
};

export const Book: Story = {
  args: {
    content: {
      ...baseItem,
      slug: "designing-data-intensive-apps",
      title: "Designing Data-Intensive Applications",
      type: "book",
      authors: ["Martin Kleppmann"],
      rating: 10,
      tags: ["architecture", "databases", "distributed-systems"],
    },
  },
};

export const Selected: Story = {
  args: {
    content: baseItem,
    selected: true,
  },
};

export const Minimal: Story = {
  args: {
    content: {
      slug: "quick-note",
      title: "Quick Note on CSS Grid",
      type: "note",
    },
  },
};
