import { defineAppConfig } from 'nuxt/app'

export default defineAppConfig({
  ui: {
    // Configure semantic colors for Alert components
    colors: {
      primary: 'indigo',
      secondary: 'slate',
      success: 'green',
      info: 'blue',
      warning: 'amber',
      error: 'red',
      neutral: 'zinc',
    },
    contentToc: {
      slots: {
        // Fixed height instead of dynamic h-(--indicator-size) for single-item highlight
        indicator: 'absolute ms-2.5 transition-[translate,height] duration-200 h-5 translate-y-(--indicator-position) w-px rounded-full',
      },
    },
  },
})
