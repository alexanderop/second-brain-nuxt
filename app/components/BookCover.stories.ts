import type { Meta, StoryObj } from "@storybook/vue3";
import BookCover from "./BookCover.vue";

const meta = {
  title: "Content/BookCover",
  component: BookCover,
  tags: ["autodocs"],
  argTypes: {
    cover: { control: "text" },
    title: { control: "text" },
  },
} satisfies Meta<typeof BookCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCover: Story = {
  args: {
    cover: "https://placehold.co/200x300?text=Book+Cover",
    title: "Designing Data-Intensive Applications",
  },
};

export const WithoutTitle: Story = {
  args: {
    cover: "https://placehold.co/200x300?text=No+Title",
  },
};

export const BrokenImage: Story = {
  args: {
    cover: "https://invalid-url.example/cover.jpg",
    title: "Missing Cover",
  },
};
