import type { Meta, StoryObj } from "@storybook/vue3";
import BaseTagPill from "./BaseTagPill.vue";

const meta = {
  title: "Base/TagPill",
  component: BaseTagPill,
  tags: ["autodocs"],
  argTypes: {
    tag: { control: "text" },
  },
} satisfies Meta<typeof BaseTagPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tag: "typescript" },
};

export const Short: Story = {
  args: { tag: "vue" },
};

export const Long: Story = {
  args: { tag: "machine-learning" },
};

/** Multiple tags side by side */
export const MultipleTags: Story = {
  render: () => ({
    components: { BaseTagPill },
    setup() {
      return { tags: ["typescript", "vue", "nuxt", "testing", "ai"] };
    },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <BaseTagPill v-for="tag in tags" :key="tag" :tag="tag" />
      </div>
    `,
  }),
};
