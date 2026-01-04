// Shared color palette for knowledge graph visualizations
// Softer pastel palette for Obsidian-like feel

import type { ContentType } from '~/constants/contentTypes'

type ColorConfig = { fill: string, glow: string }

export const typeColors: Record<ContentType, ColorConfig> = {
  book: { fill: '#fcd34d', glow: 'rgba(252, 211, 77, 0.4)' }, // Softer amber
  manga: { fill: '#fb7185', glow: 'rgba(251, 113, 133, 0.4)' }, // Rose
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
  github: { fill: '#a78bfa', glow: 'rgba(167, 139, 250, 0.4)' }, // GitHub purple
  newsletter: { fill: '#4ade80', glow: 'rgba(74, 222, 128, 0.4)' }, // Newsletter green
}

export const defaultColor: ColorConfig = { fill: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' }

// String-indexed lookup for runtime flexibility
const colorLookup: Record<string, ColorConfig> = typeColors

// Accept string for flexibility with runtime types, returns default for unknown types
export function getNodeColor(type: string): ColorConfig {
  return colorLookup[type] ?? defaultColor
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
