import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { defineEventHandler, getRouterParam, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { createOgImageMarkup } from '../../utils/og-image'

// Cache font data
let fontData: ArrayBuffer | null = null

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData

  // Use Google Fonts API to get Inter font
  const fontResponse = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
  )
  fontData = await fontResponse.arrayBuffer()
  return fontData
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''

  // Fetch page data from content
  let title = 'Second Brain'
  let description = 'Personal knowledge base'
  let type = 'note'

  try {
    const page = await queryCollection(event, 'content')
      .where('stem', '=', slug)
      .first()

    if (page) {
      title = page.title || title
      description = page.summary || description
      type = page.type || type
    }
  }
  catch {
    // Use defaults if content not found
  }

  const font = await loadFont()

  const svg = await satori(
    createOgImageMarkup(title, description, type, 'Second Brain'),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  )

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  })

  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return pngBuffer
})
