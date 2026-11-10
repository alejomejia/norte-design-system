import { scaleLinear } from '@visx/scale'
import { describe, expect, it } from 'vitest'

import { fitTicks, tickCount } from './chart'

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
