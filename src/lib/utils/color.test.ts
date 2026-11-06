import { describe, expect, it } from 'vitest'

import { blend, toHex } from './color'

describe('blend', () => {
  it('paints like the browser: black at 25% over white is #bfbfbf, mixed in gamma-encoded sRGB', () => {
    expect(toHex(blend([0, 0, 0], [1, 1, 1], 0.25))).toBe('#bfbfbf')
  })

  it('gives the bottom color at 0 and the top one at 1', () => {
    expect(toHex(blend([0, 0, 0], [1, 1, 1], 0))).toBe('#ffffff')
    expect(toHex(blend([0, 0, 0], [1, 1, 1], 1))).toBe('#000000')
  })
})
