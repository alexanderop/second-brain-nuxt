export default defineAppConfig({
  docus: {
    title: 'Second Brain',
    description: 'Personal knowledge base for capturing and connecting content using Zettelkasten-style wiki-links.',
    socials: {
      github: 'alexanderop/second-brain-nuxt',
    },
    aside: {
      level: 1,
      collapsed: false,
      exclude: [],
    },
    header: {
      logo: false,
      title: 'Second Brain',
      showLinkIcon: true,
    },
    footer: {
      credits: {
        text: 'Built with Docus',
        href: 'https://docus.dev',
        icon: 'IconDocus',
      },
    },
  },
})
