import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const filePath = resolve(process.cwd(), 'content', `${slug}.md`)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'Content not found' })
  }

  const content = readFileSync(filePath, 'utf-8')
  return { raw: content }
})
