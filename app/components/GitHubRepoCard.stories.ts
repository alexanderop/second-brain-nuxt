import type { Meta, StoryObj } from "@storybook/vue3";
import GitHubRepoCard from "./GitHubRepoCard.vue";

const meta = {
  title: "Content/GitHubRepoCard",
  component: GitHubRepoCard,
  tags: ["autodocs"],
  argTypes: {
    url: { control: "text" },
    stars: { control: "number" },
    language: { control: "text" },
  },
} satisfies Meta<typeof GitHubRepoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    url: "https://github.com/nuxt/nuxt",
    stars: 55200,
    language: "TypeScript",
  },
};

export const PythonRepo: Story = {
  args: {
    url: "https://github.com/python/cpython",
    stars: 63400,
    language: "Python",
  },
};

export const NoStars: Story = {
  args: {
    url: "https://github.com/user/private-repo",
    language: "Go",
  },
};

export const NoLanguage: Story = {
  args: {
    url: "https://github.com/user/docs-repo",
    stars: 120,
  },
};

export const Minimal: Story = {
  args: {
    url: "https://github.com/user/repo",
  },
};
