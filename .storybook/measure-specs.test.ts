import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { parseTokens } from '@/handbook/tokens/tokens'

import { describeSpecs, measureDistances, nameElement, type Rect, readScale, spacingStep } from './measure-specs'

// Read from disk: Vitest doesn't load CSS files, so a `?raw` import would come back empty.
const scale = readScale(parseTokens(readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8')))

function rect(left: number, top: number, width: number, height: number): Rect {
  return { left, top, width, height, right: left + width, bottom: top + height }
}

/** A box with only what a test sets: no padding, radius, gap or text. */
function specs(input: Partial<Parameters<typeof describeSpecs>[0]>) {
  return describeSpecs({ width: 96, height: 32, padding: [0, 0, 0, 0], radius: [0, 0, 0, 0], ...input }, scale)
}

describe('readScale', () => {
  it('reads the radius, type and weight tokens of theme.css', () => {
    expect(scale.radii.get(8)).toBe('m')
    expect(scale.text).toContainEqual({ name: 'body-s', size: 14, lineHeight: 20 })
    expect(scale.weights.get(500)).toBe('medium')
  })
})

describe('spacingStep', () => {
  it('names the steps Norte allows: the 8px grid, plus 1, 2, 4 and 12px', () => {
    expect([1, 2, 4, 8, 12, 16, 24, 40].map(spacingStep)).toEqual(['0.25', '0.5', '1', '2', '3', '4', '6', '10'])
  })

  it('leaves lengths off the grid unnamed', () => {
    expect([6, 10, 13.5, 20].map(spacingStep)).toEqual([undefined, undefined, undefined, undefined])
  })
})

describe('describeSpecs', () => {
  it('lists the size, and leaves out what the element has none of', () => {
    expect(specs({})).toEqual([{ label: 'size', value: '96 × 32' }])
  })

  it('writes padding as its shortest classes', () => {
    expect(specs({ padding: [16, 16, 16, 16] })[1]).toMatchObject({ value: '16', utility: 'p-4' })
    expect(specs({ padding: [0, 12, 0, 12] })[1]).toMatchObject({ value: '0 12', utility: 'px-3' })
    expect(specs({ padding: [8, 16, 8, 16] })[1]).toMatchObject({ value: '8 16', utility: 'py-2 px-4' })
    expect(specs({ padding: [8, 0, 16, 0] })[1]).toMatchObject({ value: '8 0 16 0', utility: 'pt-2 pb-4' })
  })

  it('marks a value off the scale', () => {
    expect(specs({ padding: [10, 10, 10, 10] })[1]).toMatchObject({ value: '10', offScale: true })
    expect(specs({ radius: [6, 6, 6, 6] })[1]).toMatchObject({ value: '6', offScale: true })
  })

  it('names the gap, and the radius by its token', () => {
    expect(specs({ gap: [8, 8], radius: [8, 8, 8, 8] }).slice(1)).toMatchObject([
      { label: 'gap', value: '8', utility: 'gap-2' },
      { label: 'radius', value: '8', utility: 'rounded-m' },
    ])
    expect(specs({ gap: [0, 0] })).toHaveLength(1)
    expect(specs({ radius: [99_999, 99_999, 99_999, 99_999] })[1]).toMatchObject({ utility: 'rounded-full' })
  })

  it('names the type by its token and weight, with a line height of its own as a step', () => {
    const type = { family: 'Inter Variable', size: 14, lineHeight: 20, weight: 500 }
    expect(specs({ type }).slice(1)).toEqual([
      { label: 'type', value: '14/20 · 500', utility: 'text-body-s font-medium', offScale: false },
      { label: 'font', value: 'Inter Variable' },
    ])
    expect(specs({ type: { ...type, lineHeight: 24, weight: 400 } })[1]).toMatchObject({ utility: 'text-body-s/6' })
    expect(specs({ type: { ...type, size: 15 } })[1]).toMatchObject({ offScale: true })
  })
})

describe('measureDistances', () => {
  it('measures the gap between facing edges', () => {
    expect(measureDistances(rect(0, 0, 40, 32), rect(48, 0, 40, 32))).toEqual([{ axis: 'x', x: 40, y: 16, length: 8 }])
  })

  it('measures an inner box to each edge of the outer one', () => {
    const lines = measureDistances(rect(16, 8, 64, 16), rect(0, 0, 96, 32))
    expect(lines.map(({ axis, length }) => [axis, length])).toEqual([
      ['y', 8],
      ['y', 8],
      ['x', 16],
      ['x', 16],
    ])
  })

  it('skips edges that touch', () => {
    expect(measureDistances(rect(0, 0, 96, 16), rect(0, 0, 96, 32))).toEqual([{ axis: 'y', x: 48, y: 16, length: 16 }])
  })
})

describe('nameElement', () => {
  it('names an element by its tag and the start of its text', () => {
    expect(nameElement('button', '  Approve ')).toBe('button "Approve"')
    expect(nameElement('p', 'Compare our five main competitors’ pricing')).toBe('p "Compare our five main co…"')
    expect(nameElement('svg', '')).toBe('svg')
  })
})
