// oxlint-disable eslint/no-console
/**
 * Build script to generate static OG images for all content pages
 *
 * Generates OG images at build time using Satori, similar to Astro Paper's approach.
 * Images are saved to public/og/[slug].png and served statically.
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import * as lucideIcons from 'lucide-static'

// Map content types to Lucide icon names (matches BaseTypeIcon.vue)
const TYPE_TO_LUCIDE: Record<string, keyof typeof lucideIcons> = {
  youtube: 'Youtube',
  podcast: 'Mic',
  article: 'FileText',
  book: 'BookOpen',
  manga: 'BookImage',
  movie: 'Clapperboard',
  tv: 'Tv',
  tweet: 'MessageCircle',
  quote: 'Quote',
  course: 'GraduationCap',
  note: 'Pencil',
  evergreen: 'Leaf',
  map: 'Hexagon',
  reddit: 'MessageSquare',
  github: 'Github',
  newsletter: 'Newspaper',
  talk: 'Presentation',
}

const CONTENT_DIR = join(process.cwd(), 'content')
const OUTPUT_DIR = join(process.cwd(), 'public', 'og')

// Excluded directories that don't need OG images
const EXCLUDED_DIRS = [
  'authors',
  'pages',
  'podcasts',
  'tweets',
  'newsletters',
  'Readwise',
  'blog',
  'Excalidraw',
  'newsletter-drafts',
  'blog-ideas',
  '_obsidian-templates',
]

// Cache font data
let fontRegular: ArrayBuffer | null = null
let fontMedium: ArrayBuffer | null = null

async function loadFonts(): Promise<{ regular: ArrayBuffer, medium: ArrayBuffer }> {
  if (fontRegular && fontMedium) {
    return { regular: fontRegular, medium: fontMedium }
  }

  console.log('  Loading Geist fonts...')

  const [regular, medium] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5/files/geist-sans-latin-400-normal.woff').then(r => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5/files/geist-sans-latin-500-normal.woff').then(r => r.arrayBuffer()),
  ])

  fontRegular = regular
  fontMedium = medium

  return { regular, medium }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

const ICON_STROKE = '#737373'
const ICON_STROKE_WIDTH = 2

function extractAttr(attrs: string, name: string, fallback = '0'): string {
  const match = attrs.match(new RegExp(`${name}="([^"]+)"`))
  return match ? match[1] : fallback
}

function parsePaths(svgString: string): SatoriElement[] {
  const elements: SatoriElement[] = []
  for (const match of svgString.matchAll(/<path\s+d="([^"]+)"\s*\/>/g)) {
    elements.push({
      type: 'path',
      props: {
        d: match[1],
        fill: 'none',
        stroke: ICON_STROKE,
        strokeWidth: ICON_STROKE_WIDTH,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    })
  }
  return elements
}

function parseRects(svgString: string): SatoriElement[] {
  const elements: SatoriElement[] = []
  for (const match of svgString.matchAll(/<rect\s+([^>]+)\/>/g)) {
    const attrs = match[1]
    elements.push({
      type: 'rect',
      props: {
        x: extractAttr(attrs, 'x'),
        y: extractAttr(attrs, 'y'),
        width: extractAttr(attrs, 'width'),
        height: extractAttr(attrs, 'height'),
        rx: extractAttr(attrs, 'rx'),
        fill: 'none',
        stroke: ICON_STROKE,
        strokeWidth: ICON_STROKE_WIDTH,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    })
  }
  return elements
}

function parseCircles(svgString: string): SatoriElement[] {
  const elements: SatoriElement[] = []
  for (const match of svgString.matchAll(/<circle\s+([^>]+)\/>/g)) {
    const attrs = match[1]
    elements.push({
      type: 'circle',
      props: {
        cx: extractAttr(attrs, 'cx'),
        cy: extractAttr(attrs, 'cy'),
        r: extractAttr(attrs, 'r'),
        fill: 'none',
        stroke: ICON_STROKE,
        strokeWidth: ICON_STROKE_WIDTH,
      },
    })
  }
  return elements
}

function parseLines(svgString: string): SatoriElement[] {
  const elements: SatoriElement[] = []
  for (const match of svgString.matchAll(/<line\s+([^>]+)\/>/g)) {
    const attrs = match[1]
    elements.push({
      type: 'line',
      props: {
        x1: extractAttr(attrs, 'x1'),
        y1: extractAttr(attrs, 'y1'),
        x2: extractAttr(attrs, 'x2'),
        y2: extractAttr(attrs, 'y2'),
        stroke: ICON_STROKE,
        strokeWidth: ICON_STROKE_WIDTH,
        strokeLinecap: 'round',
      },
    })
  }
  return elements
}

function parsePolylines(svgString: string): SatoriElement[] {
  const elements: SatoriElement[] = []
  for (const match of svgString.matchAll(/<polyline\s+points="([^"]+)"\s*\/>/g)) {
    elements.push({
      type: 'polyline',
      props: {
        points: match[1],
        fill: 'none',
        stroke: ICON_STROKE,
        strokeWidth: ICON_STROKE_WIDTH,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    })
  }
  return elements
}

/**
 * Parse SVG string and extract child elements for Satori
 */
function parseSvgChildren(svgString: string): SatoriElement[] {
  return [
    ...parsePaths(svgString),
    ...parseRects(svgString),
    ...parseCircles(svgString),
    ...parseLines(svgString),
    ...parsePolylines(svgString),
  ]
}

/**
 * Create an SVG icon element for Satori from content type
 */
function createIconElement(type: string, size = 20): SatoriElement | null {
  const iconKey = TYPE_TO_LUCIDE[type]
  if (!iconKey) return null

  const svgString = lucideIcons[iconKey]
  if (!svgString) return null

  const children = parseSvgChildren(svgString)

  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      children,
    },
  }
}

interface SatoriElement {
  type: string
  props: {
    style?: Record<string, unknown>
    children?: (SatoriElement | string)[] | SatoriElement | string
    [key: string]: unknown
  }
}

/**
 * Minimal OG image design matching the site's aesthetic
 * - Solid dark background (matches site theme)
 * - Clean typography with Geist font
 * - Subtle type indicator
 * - No flashy gradients or colors
 */
function createTypeBadge(type: string): SatoriElement {
  const iconElement = createIconElement(type, 20)
  const typeLabel: SatoriElement = {
    type: 'span',
    props: {
      style: {
        fontSize: '18px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#737373',
      },
      children: type,
    },
  }

  const badgeChildren: SatoriElement[] = iconElement
    ? [iconElement, typeLabel]
    : [typeLabel]

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      },
      children: badgeChildren,
    },
  }
}

function createOgImageMarkup(
  title: string,
  description: string,
  type: string,
): SatoriElement {
  const truncatedTitle = truncateText(title, 80)
  const truncatedDescription = truncateText(description, 140)

  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px',
        backgroundColor: '#0a0a0a',
      },
      children: [
        // Top section: Type badge with icon
        createTypeBadge(type),
        // Middle section: Title and description
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              gap: '24px',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: truncatedTitle.length > 50 ? '48px' : '56px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: '#fafafa',
                    margin: 0,
                  },
                  children: truncatedTitle,
                },
              },
              ...(truncatedDescription
                ? [
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontSize: '24px',
                          lineHeight: 1.5,
                          color: '#a3a3a3',
                          margin: 0,
                        },
                        children: truncatedDescription,
                      },
                    },
                  ]
                : []),
            ],
          },
        },
        // Bottom section: Branding
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #262626',
              paddingTop: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '28px' },
                        children: '🧠',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '20px',
                          fontWeight: 500,
                          color: '#fafafa',
                        },
                        children: 'Second Brain',
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '18px',
                    color: '#525252',
                  },
                  children: 'alexop.dev',
                },
              },
            ],
          },
        },
      ],
    },
  }
}

interface Frontmatter {
  title?: string
  type?: string
  summary?: string
}

function parseFrontmatter(content: string): Frontmatter {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return {}

  const frontmatter: Frontmatter = {}
  const lines = frontmatterMatch[1].split('\n')

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '')
      if (key === 'title') frontmatter.title = cleanValue
      if (key === 'type') frontmatter.type = cleanValue
      if (key === 'summary') frontmatter.summary = cleanValue
    }
  }

  return frontmatter
}

async function generateOgImage(
  title: string,
  description: string,
  type: string,
  fonts: { regular: ArrayBuffer, medium: ArrayBuffer },
): Promise<Buffer> {
  const markup = createOgImageMarkup(title, description, type)

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Geist', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Geist', data: fonts.medium, weight: 500, style: 'normal' },
    ],
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })

  const pngData = resvg.render()
  return pngData.asPng()
}

async function findMarkdownFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDED_DIRS.includes(entry.name)) {
        await findMarkdownFiles(fullPath, files)
      }
      continue
    }

    if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

function getSlugFromPath(filePath: string): string {
  // Get relative path from content dir
  const relativePath = filePath.replace(CONTENT_DIR + '/', '')
  // Remove .md extension and convert to slug
  return basename(relativePath, '.md')
}

async function main() {
  console.log('Generating OG images...')

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true })

  // Load fonts once
  const fonts = await loadFonts()

  // Find all markdown files
  const files = await findMarkdownFiles(CONTENT_DIR)
  console.log(`Found ${files.length} content file(s)`)

  let generated = 0
  let skipped = 0
  let errors = 0

  for (const filePath of files) {
    const slug = getSlugFromPath(filePath)
    const outputPath = join(OUTPUT_DIR, `${slug}.png`)

    try {
      // Check if OG image already exists and is newer than source
      try {
        const [sourceStat, outputStat] = await Promise.all([
          stat(filePath),
          stat(outputPath),
        ])
        if (outputStat.mtime > sourceStat.mtime) {
          skipped++
          continue
        }
      } catch {
        // Output doesn't exist, will generate
      }

      const content = await readFile(filePath, 'utf-8')
      const frontmatter = parseFrontmatter(content)

      if (!frontmatter.title) {
        console.log(`  Skipping ${slug}: no title`)
        skipped++
        continue
      }

      const png = await generateOgImage(
        frontmatter.title,
        frontmatter.summary || '',
        frontmatter.type || 'note',
        fonts,
      )

      await writeFile(outputPath, png)
      generated++

      if (generated % 50 === 0) {
        console.log(`  Generated ${generated} images...`)
      }
    } catch (error) {
      console.error(`  Error generating OG image for ${slug}:`, error)
      errors++
    }
  }

  console.log(`Done! Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`)
}

main().catch(console.error)
