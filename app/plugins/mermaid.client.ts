import { defineNuxtPlugin } from '#imports'
import mermaid from 'mermaid'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      mermaid: () => mermaid,
    },
  }
})
