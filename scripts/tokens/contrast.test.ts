import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { contrastRatio, isInSrgbGamut, oklchToLinearRgb, parseOklch } from './color.ts'
import { readColors } from './theme.ts'

/** WCAG 2.2 AA: 4.5:1 for text (1.4.3), 3:1 for the borders and focus rings that outline a control (1.4.11). */
const TEXT = 4.5
const UI = 3

/** Every pair a component may put together: [foreground role, background role, minimum ratio]. */
const PAIRS: [string, string, number][] = [
  ...['ink', 'ink-muted', 'ink-subtle', 'accent-ink', 'success', 'warning', 'danger'].flatMap((text) =>
    ['canvas', 'surface'].map((background): [string, string, number] => [text, background, TEXT]),
  ),
  ['ink', 'surface-muted', TEXT],
  ['ink-muted', 'surface-muted', TEXT],
  ['ink-subtle', 'surface-muted', TEXT],
  ['ink', 'accent-subtle', TEXT],
  ['accent-ink', 'accent-subtle', TEXT],
  ['on-accent', 'accent', TEXT],
  ['on-accent', 'accent-hover', TEXT],
  ['success', 'success-subtle', TEXT],
  ['warning', 'warning-subtle', TEXT],
  ['danger', 'danger-subtle', TEXT],
  ...['line-strong', 'focus'].flatMap((ui) =>
    ['canvas', 'surface'].map((background): [string, string, number] => [ui, background, UI]),
  ),
]

describe('color roles', () => {
  const colors = readColors()

  function rgb(role: string) {
    const value = colors.get(`color-${role}`)
    if (value === undefined) throw new Error(`No --color-${role} token`)
    return oklchToLinearRgb(parseOklch(value))
  }

  for (const [foreground, background, minimum] of PAIRS) {
    it(`${foreground} on ${background} reaches ${minimum}:1`, () => {
      const ratio = contrastRatio(rgb(foreground), rgb(background))
      assert.ok(ratio >= minimum, `${ratio.toFixed(2)}:1, needs ${minimum}:1`)
    })
  }
})

describe('primitives', () => {
  it('stay inside the sRGB gamut, so they look the same on every screen', () => {
    const outside = [...readColors()]
      .filter(([, value]) => !isInSrgbGamut(oklchToLinearRgb(parseOklch(value))))
      .map(([name]) => name)
    assert.deepEqual(outside, [])
  })
})
