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

  it.each([
    [400, '0.4s'],
    [9990, '9.9s'],
    [12_340, '12.3s'],
    [59_990, '59.9s'],
    [64_200, '1m 04.2s'],
    [671_050, '11m 11.0s'],
  ])('shows %dms precisely as %s', (ms, text) => {
    expect(formatElapsed(ms, { precise: true })).toBe(text)
  })
})
