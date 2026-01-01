// Shared color palette for knowledge graph visualizations
// Softer pastel palette for Obsidian-like feel

export const typeColors: Record<string, { fill: string, glow: string }> = {
  book: { fill: '#fcd34d', glow: 'rgba(252, 211, 77, 0.4)' }, // Softer amber
  podcast: { fill: '#c4b5fd', glow: 'rgba(196, 181, 253, 0.4)' }, // Softer violet
  article: { fill: '#67e8f9', glow: 'rgba(103, 232, 249, 0.4)' }, // Softer cyan
  note: { fill: '#6ee7b7', glow: 'rgba(110, 231, 183, 0.4)' }, // Softer emerald
  youtube: { fill: '#fca5a5', glow: 'rgba(252, 165, 165, 0.4)' }, // Softer red
  course: { fill: '#f9a8d4', glow: 'rgba(249, 168, 212, 0.4)' }, // Softer pink
  quote: { fill: '#fdba74', glow: 'rgba(253, 186, 116, 0.4)' }, // Softer orange
  movie: { fill: '#a5b4fc', glow: 'rgba(165, 180, 252, 0.4)' }, // Softer indigo
  tv: { fill: '#d8b4fe', glow: 'rgba(216, 180, 254, 0.4)' }, // Softer purple
  tweet: { fill: '#7dd3fc', glow: 'rgba(125, 211, 252, 0.4)' }, // Softer sky
  evergreen: { fill: '#86efac', glow: 'rgba(134, 239, 172, 0.4)' }, // Softer green
  map: { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' }, // Pink for Maps of Content
  reddit: { fill: '#ff6b35', glow: 'rgba(255, 107, 53, 0.4)' }, // Reddit orange
  default: { fill: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' }, // Softer slate
}

export const defaultColor = { fill: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' }

export function getNodeColor(type: string): { fill: string, glow: string } {
  return typeColors[type] ?? defaultColor
}

export function getGlowFilter(type: string): string {
  return `url(#glow-${type in typeColors ? type : 'default'})`
}

export const graphColors = {
  selected: '#ffffff', // White ring for selected
  connectedEdge: 'rgba(255, 255, 255, 0.4)', // Brighter edge for connections
  edge: 'rgba(255, 255, 255, 0.15)', // Subtle white edge (Obsidian-like)
  text: 'currentColor',
}
