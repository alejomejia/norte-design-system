import { type ClassValue, clsx } from 'clsx'
import { type CSSProperties } from 'react'
import { extendTailwindMerge } from 'tailwind-merge'
import { createTV, type TWMergeConfig } from 'tailwind-variants'

// tailwind-merge only knows Tailwind's default names, and guesses that unknown `text-*` classes are colors. Norte's
// type scale has its own names, so they're listed here, or `cn('text-caption text-ink')` would drop the size. `cn` and
// `tv` share it, so both resolve conflicts the same way.
const TW_MERGE_CONFIG = {
  extend: {
    theme: {
      text: ['caption', 'body-s', 'body', 'heading-s', 'heading-m', 'heading-l', 'display'],
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
