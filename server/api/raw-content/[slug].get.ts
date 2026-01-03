import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  try {
    const filePath = resolve(process.cwd(), 'content', `${slug}.md`)
    const content = readFileSync(filePath, 'utf-8')
    return { raw: content }
  }
  catch {
    throw createError({ statusCode: 404, message: 'Content not found' })
  }
})
