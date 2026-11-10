import { describe, expect, it } from 'vitest'

import { domainOf, isExternalUrl } from './url'

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

describe('domainOf', () => {
  it.each([
    ['https://brightloop.example/pricing', 'brightloop.example'],
    ['https://www.tandem.example/plans?seats=10', 'tandem.example'],
    ['http://orbit.example', 'orbit.example'],
    ['//cdn.kitewise.example/logo.png', 'cdn.kitewise.example'],
  ])('reads the site of %s', (href, domain) => {
    expect(domainOf(href)).toBe(domain)
  })

  it.each(['/files/briefs/q3-pricing.md', '#source-2', 'mailto:sofia@norte.com', 'https://', undefined])(
    'has none for %s',
    (href) => {
      expect(domainOf(href)).toBeUndefined()
    },
  )
})
