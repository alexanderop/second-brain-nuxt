import type { Meta, StoryObj } from "@storybook/vue3";
import BaseTypeIcon from "./BaseTypeIcon.vue";
import { contentTypeValues } from "~/constants/contentTypes";

const meta = {
  title: "Base/TypeIcon",
  component: BaseTypeIcon,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: [...contentTypeValues] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof BaseTypeIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { type: "article", size: "md" },
};

export const Small: Story = {
  args: { type: "podcast", size: "sm" },
};

export const Large: Story = {
  args: { type: "book", size: "lg" },
};

/** All content types rendered side-by-side */
export const AllTypes: Story = {
  render: () => ({
    components: { BaseTypeIcon },
    setup() {
      return { types: contentTypeValues };
    },
    template: `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <div v-for="t in types" :key="t" style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
          <BaseTypeIcon :type="t" size="lg" />
          <span style="font-size: 0.7rem;">{{ t }}</span>
        </div>
      </div>
    `,
  }),
};
