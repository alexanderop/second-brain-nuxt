import mermaid from 'mermaid'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      mermaid: () => mermaid,
    },
  }
})
