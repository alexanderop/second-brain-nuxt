import { describe, expect, it } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('/table page', () => {
  it('renders without crashing', async () => {
    const html = await $fetch('/table', { responseType: 'text' })
    expect(html).toContain('<!DOCTYPE html>')
  })

  it('accepts type filter in URL', async () => {
    const html = await $fetch('/table?type=book', { responseType: 'text' })
    expect(html).toContain('<!DOCTYPE html>')
  })

  it('accepts multiple filters in URL', async () => {
    const html = await $fetch('/table?type=book,podcast&sort=title', { responseType: 'text' })
    expect(html).toContain('<!DOCTYPE html>')
  })

  it('handles pagination parameter', async () => {
    const html = await $fetch('/table?page=1', { responseType: 'text' })
    expect(html).toContain('<!DOCTYPE html>')
  })
})
