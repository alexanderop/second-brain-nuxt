import type { Meta, StoryObj } from "@storybook/vue3";
import BaseRatingDisplay from "./BaseRatingDisplay.vue";

const meta = {
  title: "Base/RatingDisplay",
  component: BaseRatingDisplay,
  tags: ["autodocs"],
  argTypes: {
    rating: { control: { type: "range", min: 0, max: 10, step: 1 } },
  },
} satisfies Meta<typeof BaseRatingDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { rating: 7 },
};

export const Low: Story = {
  args: { rating: 2 },
};

export const Perfect: Story = {
  args: { rating: 10 },
};

export const Zero: Story = {
  args: { rating: 0 },
};

/** All ratings from 1 to 10 */
export const AllRatings: Story = {
  render: () => ({
    components: { BaseRatingDisplay },
    setup() {
      return { ratings: Array.from({ length: 10 }, (_, i) => i + 1) };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div v-for="r in ratings" :key="r" style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="width: 1.5rem; text-align: right; font-size: 0.875rem;">{{ r }}</span>
          <BaseRatingDisplay :rating="r" />
        </div>
      </div>
    `,
  }),
};
