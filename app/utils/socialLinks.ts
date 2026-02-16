interface SocialLink {
  icon: string
  url: string
  label: string
}

interface Socials {
  twitter?: string
  github?: string
  linkedin?: string
  youtube?: string
  bluesky?: string
}

export function buildSocialLinks(socials: Socials | undefined | null): SocialLink[] {
  if (!socials) return []
  const links: SocialLink[] = []
  if (socials.twitter) links.push({ icon: 'i-lucide-twitter', url: `https://twitter.com/${socials.twitter}`, label: 'Twitter' })
  if (socials.github) links.push({ icon: 'i-lucide-github', url: `https://github.com/${socials.github}`, label: 'GitHub' })
  if (socials.linkedin) links.push({ icon: 'i-lucide-linkedin', url: `https://linkedin.com/in/${socials.linkedin}`, label: 'LinkedIn' })
  if (socials.youtube) links.push({ icon: 'i-lucide-youtube', url: `https://youtube.com/@${socials.youtube}`, label: 'YouTube' })
  if (socials.bluesky) links.push({ icon: 'i-lucide-cloud', url: `https://bsky.app/profile/${socials.bluesky}`, label: 'Bluesky' })
  return links
}
