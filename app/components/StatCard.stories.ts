import type { Meta, StoryObj } from "@storybook/vue3";
import StatCard from "./StatCard.vue";

const meta = {
  title: "Content/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    icon: { control: "text" },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Total Items",
    value: 142,
  },
};

export const WithIcon: Story = {
  args: {
    label: "Articles",
    value: 37,
    icon: "i-lucide-file-text",
  },
};

export const WithPositiveTrend: Story = {
  args: {
    label: "This Month",
    value: 12,
    icon: "i-lucide-trending-up",
    trend: { value: 3, label: "vs last month" },
  },
};

export const WithNegativeTrend: Story = {
  args: {
    label: "This Month",
    value: 5,
    icon: "i-lucide-trending-down",
    trend: { value: -2, label: "vs last month" },
  },
};

export const LargeNumber: Story = {
  args: {
    label: "Total Words",
    value: "1,234,567",
    icon: "i-lucide-text",
  },
};
