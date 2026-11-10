import { scaleLinear } from '@visx/scale'
import { describe, expect, it } from 'vitest'

import { fitTicks, glideBetween, positionOf, spanOf, tickCount } from './line-chart.utils'

describe('tickCount', () => {
  it.each([
    [240, 56, 4],
    [600, 56, 10],
    [160, 40, 4],
    [90, 56, 2],
    [0, 56, 2],
  ])('fits %j px at %j apart as %j ticks', (length, spacing, expected) => {
    expect(tickCount(length, spacing)).toBe(expected)
  })
})

describe('fitTicks', () => {
  const sizes = { spacing: 56, charWidth: 7.5, gap: 16 }

  it('keeps every tick whose labels fit', () => {
    const scale = scaleLinear({ domain: [0, 4.2], range: [0, 232] })
    expect(fitTicks(scale, 232, (m) => `${m}m`, sizes)).toEqual([0, 1, 2, 3, 4])
  })

  it('drops ticks while the labels would touch', () => {
    const scale = scaleLinear({ domain: [0, 4.2], range: [0, 592] })
    // Ten fit by spacing (half minutes, 70px apart), but a 12-character label needs 106px.
    expect(fitTicks(scale, 592, (m) => `${m} minutes in`, sizes)).toEqual([0, 1, 2, 3, 4])
    expect(fitTicks(scale, 592, (m) => `${m}m`, sizes)).toHaveLength(9)
  })

  it('keeps two ticks at least', () => {
    const scale = scaleLinear({ domain: [0, 10], range: [0, 100] })
    expect(fitTicks(scale, 100, () => 'a very long label', sizes)).toEqual(scale.ticks(2))
  })
})

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
