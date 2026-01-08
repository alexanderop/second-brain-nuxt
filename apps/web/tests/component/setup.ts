/**
 * Browser test setup file
 * Imports global styles so Tailwind classes work in component tests
 */
import '~/assets/css/main.css'

// Ensure test container has dimensions for components with height: 100%
const style = document.createElement('style')
style.textContent = `
  #vitest-browser-app {
    width: 100%;
    height: 100vh;
  }
`
document.head.appendChild(style)
