import { type ClassValue, clsx } from 'clsx'
import { type CSSProperties } from 'react'
import { extendTailwindMerge } from 'tailwind-merge'
import { createTV, type TWMergeConfig } from 'tailwind-variants'

// tailwind-merge only knows Tailwind's default names, and guesses that unknown `text-*` classes are colors. Norte's
// type scale and easings have their own names, so they're listed here, or `cn('text-caption text-ink')` would drop the
// size and `cn('ease-standard', 'ease-spring')` would keep both. `cn` and `tv` share it, so both resolve conflicts the
// same way.
const TW_MERGE_CONFIG = {
  extend: {
    theme: {
      text: ['caption', 'body-s', 'body', 'heading-s', 'heading-m', 'heading-l', 'display'],
      ease: ['standard', 'enter', 'exit', 'spring'],
    },
  },
} satisfies TWMergeConfig

const twMerge = extendTailwindMerge(TW_MERGE_CONFIG)

/**
 * tailwind-variants' `tv`, with Norte's merge config: a component's variants, slots and defaults in one recipe, and an
 * app's `className` merged over it. Import it from here, never from `tailwind-variants`.
 * @example
 * const badge = tv({ base: 'rounded-s px-2', variants: { tone: { neutral: 'bg-surface-muted' } } })
 */
export const tv = createTV({ twMergeConfig: TW_MERGE_CONFIG })

export type { VariantProps } from 'tailwind-variants'

/**
 * Joins class values and drops the Tailwind classes a later one overrides.
 * @example
 * cn('px-2', isLarge && 'px-4') // 'px-4' when isLarge is true
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Turns runtime values into CSS variables for the `style` prop, so classes read them (`bg-(--swatch)`) and stay in
 * charge of the styling. Numbers become rem (px ÷ 16); strings pass through, so unitless values go as strings.
 * @example
 * toCSSVars({ gap: 16, swatch: 'var(--color-blue-600)' }) // { '--gap': '1rem', '--swatch': 'var(--color-blue-600)' }
 */
export function toCSSVars(vars: Record<string, number | string | null | undefined>): CSSProperties {
  return Object.fromEntries(
    Object.entries(vars)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [`--${key}`, typeof value === 'number' ? `${value / 16}rem` : value]),
  ) as CSSProperties
}

/** A color as three sRGB channels from 0 to 1, the way a shader takes it. */
export type Rgb = [r: number, g: number, b: number]

let colorProbe: CanvasRenderingContext2D | null | undefined

/**
 * The color a CSS value paints on an element, as sRGB channels from 0 to 1, for code that can't read CSS, like a
 * shader: `var(--color-blue-600)` and `oklch(…)` both work. Black if the value isn't a color. Client-only.
 * @example
 * readCssColor(canvas, 'var(--color-blue-600)') // [0.08, 0.36, 0.93]
 */
export function readCssColor(element: HTMLElement, color: string): Rgb {
  const previous = element.style.color
  element.style.color = color
  const computed = getComputedStyle(element).color
  element.style.color = previous

  // A 1px canvas turns any color syntax the browser knows into sRGB bytes.
  colorProbe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!colorProbe) return [0, 0, 0]
  colorProbe.clearRect(0, 0, 1, 1)
  colorProbe.fillStyle = '#000'
  colorProbe.fillStyle = computed
  colorProbe.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = colorProbe.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}
