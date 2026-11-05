import { describe, expect, it } from 'vitest'

import { formatElapsed } from './time'

describe('formatElapsed', () => {
  it.each([
    [400, '0.4s'],
    [9940, '9.9s'],
    [12_300, '12s'],
    [64_000, '1m 04s'],
    [-5, '0.0s'],
  ])('shows %dms as %s', (ms, text) => {
    expect(formatElapsed(ms)).toBe(text)
  })
})
