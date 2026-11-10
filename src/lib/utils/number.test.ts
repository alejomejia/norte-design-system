import { describe, expect, it } from 'vitest'

import { formatCompact, nearestIndex } from './number'

describe('formatCompact', () => {
  it.each([
    [0, '0'],
    [950, '950'],
    [13_400, '13.4K'],
    [13_449, '13.4K'],
    [38_200, '38.2K'],
    [1_250_000, '1.3M'],
  ])('prints %j as %j', (value, expected) => {
    expect(formatCompact(value)).toBe(expected)
  })

  it('follows the locale', () => {
    expect(formatCompact(13_400, 'de')).toBe('13.400')
  })
})

describe('nearestIndex', () => {
  const xs = [0, 0.5, 1, 1.5, 2, 4.2]

  it.each([
    [-3, 0],
    [0, 0],
    [0.2, 0],
    [0.3, 1],
    [1.49, 3],
    [3, 4],
    [3.2, 5],
    [10, 5],
  ])('finds %j at %j', (target, expected) => {
    expect(nearestIndex(xs, target)).toBe(expected)
  })

  it('takes the earlier one on a tie', () => {
    expect(nearestIndex(xs, 0.25)).toBe(0)
  })

  it('handles one value and none', () => {
    expect(nearestIndex([3], 100)).toBe(0)
    expect(nearestIndex([], 1)).toBe(-1)
  })
})
