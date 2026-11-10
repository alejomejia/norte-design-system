import { describe, expect, it } from 'vitest'

import { glideBetween, positionOf, spanOf } from './line-chart.utils'

describe('spanOf', () => {
  it('spans the values', () => {
    expect(spanOf([0.5, 4.2, 0, 2])).toEqual([0, 4.2])
  })

  it('gives one value a span around it', () => {
    expect(spanOf([3])).toEqual([2, 4])
    expect(spanOf([7, 7, 7])).toEqual([6, 8])
  })

  it('gives no values a unit span', () => {
    expect(spanOf([])).toEqual([0, 1])
  })
})

describe('positionOf', () => {
  it('places a value along the axis, from the bottom up when flipped', () => {
    expect(positionOf(1, [0, 4], 400)).toBe(100)
    expect(positionOf(1, [0, 4], 400, true)).toBe(300)
  })
})

describe('glideBetween', () => {
  it('shifts a scrolled axis back by one step', () => {
    expect(glideBetween([0, 4], [1, 5], 400)).toEqual({ scale: 1, shift: 100 })
  })

  it.each([
    [[0, 4], [0, 8], false],
    [[0, 15_000], [0, 20_000], true],
    [[2, 6], [3, 9], true],
  ] as const)('takes every new position back to its old one: %j to %j', (from, to, flipped) => {
    const { scale, shift } = glideBetween(from, to, 160, flipped)
    for (const value of [from[0], to[0], 3, to[1]]) {
      expect(positionOf(value, to, 160, flipped) * scale + shift).toBeCloseTo(positionOf(value, from, 160, flipped))
    }
  })
})
