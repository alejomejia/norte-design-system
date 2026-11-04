import { tv } from '@/lib/utils'

import { type BUTTON_SIZES, type BUTTON_VARIANTS } from './button.const'

/**
 * A button's look. Hover only applies to an enabled button (`not-data-disabled:`), so a disabled one doesn't react.
 * Loading keeps the button at full strength: it's busy, not unavailable.
 */
export const button = tv({
  base: [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-m font-medium whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,scale] duration-(--duration-fast) ease-standard',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'not-data-disabled:active:scale-98',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'bg-accent text-on-accent not-data-disabled:hover:bg-accent-hover',
      secondary: 'border border-line-strong bg-surface text-ink not-data-disabled:hover:bg-surface-muted',
      ghost: 'text-ink not-data-disabled:hover:bg-surface-muted',
      danger: 'border border-danger bg-surface text-danger not-data-disabled:hover:bg-danger-subtle',
    } satisfies Record<(typeof BUTTON_VARIANTS)[number], string>,
    size: {
      s: 'h-8 px-3 text-body-s',
      m: 'h-10 px-4 text-body-s',
    } satisfies Record<(typeof BUTTON_SIZES)[number], string>,
    loading: {
      true: 'data-disabled:cursor-progress data-disabled:opacity-100',
    },
  },
  defaultVariants: { variant: 'primary', size: 'm', loading: false },
})

/** The label and its icons, side by side. Hidden, not removed, while loading, so the button keeps its width and name. */
export const buttonContent = tv({
  base: 'inline-flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0',
  variants: {
    loading: { true: 'opacity-0' },
  },
})
