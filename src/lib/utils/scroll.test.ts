import { describe, expect, it } from 'vitest'

import { getScrollEdges, scrollPageOffset } from './scroll'

describe('getScrollEdges', () => {
  it.each([
    ['content that fits', { scrollLeft: 0, scrollWidth: 300, clientWidth: 300 }, { start: false, end: false }],
    [
      'the start of a row that overflows',
      { scrollLeft: 0, scrollWidth: 500, clientWidth: 300 },
      { start: false, end: true },
    ],
    ['the middle', { scrollLeft: 100, scrollWidth: 500, clientWidth: 300 }, { start: true, end: true }],
    ['the end', { scrollLeft: 200, scrollWidth: 500, clientWidth: 300 }, { start: true, end: false }],
    [
      'the end, a sub-pixel short',
      { scrollLeft: 199.5, scrollWidth: 500, clientWidth: 300 },
      { start: true, end: false },
    ],
    [
      'the middle of a right-to-left row',
      { scrollLeft: -100, scrollWidth: 500, clientWidth: 300 },
      { start: true, end: true },
    ],
    [
      'the end of a right-to-left row',
      { scrollLeft: -200, scrollWidth: 500, clientWidth: 300 },
      { start: true, end: false },
    ],
  ])('reads %s', (_, scroll, edges) => {
    expect(getScrollEdges(scroll)).toEqual(edges)
  })
})

describe('scrollPageOffset', () => {
  it.each([
    ['forward, a page less both fades', 320, 1, 'ltr', 192],
    ['back', 320, -1, 'ltr', -192],
    ['forward in a right-to-left row, to the left', 320, 1, 'rtl', -192],
    ['back in a right-to-left row, to the right', 320, -1, 'rtl', 192],
    ['at least one fade wide, in a row narrower than both fades', 100, 1, 'ltr', 64],
  ] as const)('scrolls %s', (_, clientWidth, direction, writing, offset) => {
    expect(scrollPageOffset(clientWidth, direction, writing)).toBe(offset)
  })
})
