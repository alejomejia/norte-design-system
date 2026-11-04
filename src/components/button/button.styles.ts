import { tv } from '@/lib/utils'

import { type BUTTON_SIZES, type BUTTON_VARIANTS } from './button.const'

/**
 * A button's look. Hovering grows a fill from the button's center (`before:`, opacity and scale only, so it stays on
 * the compositor), and pressing sinks it a little, then lets it spring back. Hover only applies to an enabled button
 * (`not-data-disabled:`), so a disabled or busy one doesn't react. Busy keeps the button at full strength: it's
 * working, not unavailable.
 */
export const button = tv({
  base: [
    'relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-m font-medium whitespace-nowrap select-none',
    'transition-transform duration-(--duration-spring) ease-spring not-data-disabled:active:scale-97',
    'before:absolute before:inset-0 before:-z-10 before:scale-x-75 before:scale-y-50 before:rounded-m before:opacity-0',
    'before:transition-[opacity,scale] before:duration-(--duration-slow) before:ease-enter',
    'not-data-disabled:hover:before:scale-100 not-data-disabled:hover:before:opacity-100',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'bg-accent text-on-accent before:bg-accent-hover',
      secondary: 'border border-line-strong bg-surface text-ink before:bg-surface-muted',
      ghost: 'text-ink before:bg-surface-muted',
      danger: 'border border-danger bg-surface text-danger before:bg-danger-subtle',
    } satisfies Record<(typeof BUTTON_VARIANTS)[number], string>,
    size: {
      s: 'h-8 px-3 text-body-s',
      m: 'h-10 px-4 text-body-s',
    } satisfies Record<(typeof BUTTON_SIZES)[number], string>,
    busy: {
      true: 'data-disabled:cursor-default data-disabled:opacity-100',
    },
    loading: {
      true: 'data-disabled:cursor-progress',
    },
  },
  defaultVariants: { variant: 'primary', size: 'm', busy: false, loading: false },
})

/**
 * The label and its icons, side by side. Hidden, not removed, while the button is busy, so it keeps its width and
 * name; it shrinks away and springs back.
 */
export const buttonContent = tv({
  base: 'inline-flex items-center gap-2 transition-[opacity,scale] duration-(--duration-spring) ease-spring [&_svg]:size-4 [&_svg]:shrink-0',
  variants: {
    busy: { true: 'scale-90 opacity-0' },
  },
})
