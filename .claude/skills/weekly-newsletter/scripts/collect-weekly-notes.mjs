#!/usr/bin/env node
/**
 * collect-weekly-notes.mjs
 * Collects notes added last week and outputs structured JSON for newsletter generation
 * (Default: previous week, since newsletter is published on Monday)
 *
 * Usage: node collect-weekly-notes.mjs [--week YYYY-Www]
 *
 * Options:
 *   --week YYYY-Www   Specify week (default: previous week for Monday publishing)
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { basename } from 'path'

// Parse arguments
const args = process.argv.slice(2)
let specifiedWeek = null

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--week' && args[i + 1]) {
    specifiedWeek = args[i + 1]
    i++
  }
}

// Calculate week boundaries
function getWeekBoundaries(weekStr) {
  const now = new Date()

  if (weekStr) {
    // Parse YYYY-Www format
    const match = weekStr.match(/^(\d{4})-W(\d{2})$/)
    if (!match) throw new Error(`Invalid week format: ${weekStr}`)
    const [, year, week] = match

    // Get first day of the year
    const jan1 = new Date(parseInt(year), 0, 1)
    // Find the first Monday
    const dayOfWeek = jan1.getDay()
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
    const firstMonday = new Date(jan1)
    firstMonday.setDate(jan1.getDate() + daysToMonday)
    // Add weeks
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (parseInt(week) - 1) * 7)
    return weekStart
  }

  // Previous week: find last week's Monday (for Monday publishing)
  const dayOfWeek = now.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - daysToSubtract)
  // Go back one more week to get last week
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  lastMonday.setHours(0, 0, 0, 0)
  return lastMonday
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function getISOWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
}

const weekStart = getWeekBoundaries(specifiedWeek)
const weekEnd = new Date(weekStart)
weekEnd.setDate(weekStart.getDate() + 6)
const weekEndPlusOne = new Date(weekStart)
weekEndPlusOne.setDate(weekStart.getDate() + 7)

const weekStartStr = formatDate(weekStart)
const weekEndStr = formatDate(weekEnd)
const weekEndPlusOneStr = formatDate(weekEndPlusOne)
const isoWeek = getISOWeek(weekStart)

// Directories to exclude
const excludeDirs = [
  'content/authors/',
  'content/private/',
  'content/podcasts/',
  'content/newsletters/',
  'content/blog/',
  'content/blog-ideas/',
  'content/newsletter-drafts/',
  'content/tweets/',
]

// Find files added this week using git
function getFilesAddedThisWeek(path, since, until) {
  try {
    const cmd = `git log --since="${since}" --until="${until}" --diff-filter=A --name-only --pretty=format: -- '${path}'`
    const output = execSync(cmd, { encoding: 'utf8' })
    return output
      .split('\n')
      .filter((f) => f.trim())
      .filter((f, i, arr) => arr.indexOf(f) === i) // unique
  } catch {
    return []
  }
}

// Parse frontmatter from markdown file
function parseFrontmatter(filePath) {
  if (!existsSync(filePath)) return null

  const content = readFileSync(filePath, 'utf8')
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter = {}
  const lines = match[1].split('\n')
  let currentKey = null
  let arrayValues = []
  let inArray = false

  for (const line of lines) {
    // Check for array item
    if (inArray && line.match(/^\s+-\s/)) {
      const value = line.replace(/^\s+-\s/, '').replace(/^["']|["']$/g, '').trim()
      arrayValues.push(value)
      continue
    }

    // End of array
    if (inArray && !line.match(/^\s+-\s/) && line.includes(':')) {
      frontmatter[currentKey] = arrayValues
      arrayValues = []
      inArray = false
    }

    // Check for key: value
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      const [, key, value] = kvMatch

      // Check for inline array [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key] = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        continue
      }

      // Check for start of multiline array
      if (value === '' || value === '[]') {
        currentKey = key
        inArray = true
        arrayValues = []
        continue
      }

      // Simple value
      frontmatter[key] = value.replace(/^["']|["']$/g, '')
    }
  }

  // Handle trailing array
  if (inArray && arrayValues.length > 0) {
    frontmatter[currentKey] = arrayValues
  }

  return frontmatter
}

// Get files
const allFiles = getFilesAddedThisWeek('content/*.md', weekStartStr, weekEndPlusOneStr)
const noteFiles = allFiles.filter((f) => !excludeDirs.some((dir) => f.startsWith(dir)))
const tweetFiles = getFilesAddedThisWeek('content/tweets/*.md', weekStartStr, weekEndPlusOneStr)

// Process notes
const notes = noteFiles
  .map((file) => {
    const fm = parseFrontmatter(file)
    if (!fm) return null

    return {
      slug: basename(file, '.md'),
      title: fm.title || '',
      type: fm.type || 'note',
      summary: fm.summary || '',
      url: fm.url || '',
      tags: Array.isArray(fm.tags) ? fm.tags.join(', ') : fm.tags || '',
    }
  })
  .filter(Boolean)

// Process tweets
const tweets = tweetFiles
  .map((file) => {
    const fm = parseFrontmatter(file)
    if (!fm) return null

    return {
      slug: basename(file, '.md'),
      title: fm.title || '',
      url: fm.url || '',
    }
  })
  .filter(Boolean)

// Output JSON
const output = {
  week: isoWeek,
  weekStart: weekStartStr,
  weekEnd: weekEndStr,
  notes,
  tweets,
}

console.log(JSON.stringify(output, null, 2))
