import { readFileSync } from 'node:fs'

import { spring } from 'motion'
import { describe, expect, it } from 'vitest'

import { parseTokens } from '@/handbook/tokens/tokens'
import { contrastRatio, isInSrgbGamut, oklchToLinearRgb, parseOklch } from '@/lib/utils'

// Read from disk: Vitest doesn't load CSS files, so a `?raw` import would come back empty.
const tokens = parseTokens(readFileSync(new URL('./theme.css', import.meta.url), 'utf8'))

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
  ['on-inverse', 'inverse', TEXT],
  ['success', 'success-subtle', TEXT],
  ['warning', 'warning-subtle', TEXT],
  ['danger', 'danger-subtle', TEXT],
  ['danger', 'danger-muted', TEXT],
  ['ink', 'surface-strong', TEXT],
  ...['line-strong', 'focus'].flatMap((ui) =>
    ['canvas', 'surface'].map((background): [string, string, number] => [ui, background, UI]),
  ),
]

function rgb(role: string) {
  const token = tokens.get(`color-${role}`)
  if (!token) throw new Error(`No --color-${role} token`)
  return oklchToLinearRgb(parseOklch(token.value))
}

describe('color roles', () => {
  it.each(PAIRS)('%s on %s reaches %d:1', (foreground, background, minimum) => {
    expect(contrastRatio(rgb(foreground), rgb(background))).toBeGreaterThanOrEqual(minimum)
  })
})

describe('primitives', () => {
  it('stay inside the sRGB gamut, so they look the same on every screen', () => {
    const outside = [...tokens.values()]
      .filter(({ name, value }) => name.startsWith('color-') && !isInSrgbGamut(oklchToLinearRgb(parseOklch(value))))
      .map(({ name }) => name)
    expect(outside).toEqual([])
  })
})

describe('the spring', () => {
  it("is Motion's spring(0.3, 0.3), so CSS and Motion animations settle the same way", () => {
    const easing = tokens.get('ease-spring')?.value.replaceAll(/\s+/g, ' ').replace('( ', '(').replace(' )', ')')
    expect(`${tokens.get('duration-spring')?.value} ${easing}`).toBe(String(spring(0.3, 0.3)))
  })
})
