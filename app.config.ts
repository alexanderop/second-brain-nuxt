export default defineAppConfig({
  ui: {
    contentToc: {
      slots: {
        // Fixed height instead of dynamic h-(--indicator-size) for single-item highlight
        indicator: 'absolute ms-2.5 transition-[translate,height] duration-200 h-5 translate-y-(--indicator-position) w-px rounded-full',
      },
    },
  },
})
