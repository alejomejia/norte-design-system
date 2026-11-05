import { describe, expect, it } from 'vitest'

import { getScrollEdges } from './scroll'

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
