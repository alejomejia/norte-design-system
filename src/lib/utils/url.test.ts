import { describe, expect, it } from 'vitest'

import { isExternalUrl } from './url'

describe('isExternalUrl', () => {
  it.each([
    'https://brightloop.example/pricing',
    'http://orbit.example',
    'HTTPS://tandem.example',
    '//cdn.example/a.png',
  ])('treats %s as another site', (href) => {
    expect(isExternalUrl(href)).toBe(true)
  })

  it.each(['/runs/128', 'runs/128', '#sources', '?tab=logs', 'mailto:sofia@norte.com', 'tel:+34600000000', ''])(
    'keeps %s in the app',
    (href) => {
      expect(isExternalUrl(href)).toBe(false)
    },
  )

  it('keeps a missing href in the app', () => {
    expect(isExternalUrl(undefined)).toBe(false)
  })
})
