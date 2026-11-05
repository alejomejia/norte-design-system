import { tv } from '@/lib/utils'

import { type BUTTON_HOVERS, type BUTTON_SIZES, type BUTTON_VARIANTS } from './button.const'

/**
 * A button's look. Hovering brings in a fill, a layer (`before:`) that only scales and fades, so it stays on the
 * compositor. `wipe` sweeps it across from the left, and when the pointer leaves, it carries on out to the right rather
 * than rewinding: its origin flips with the hover. `fade` is the quiet one, for buttons that come in rows: the fill fades
 * in while it settles from a little smaller, arriving quickly and leaving a touch slower, so running the pointer along a
 * toolbar leaves a soft trail instead of a flash on every button. Pressing sinks the button a little and lets it spring back. Hover only applies to an
 * enabled button (`not-data-disabled:`), so a disabled or busy one doesn't react. Busy keeps the button at full
 * strength: it's working, not unavailable.
 */
export const button = tv({
  base: [
    'relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-m font-medium whitespace-nowrap select-none',
    'transition-[scale,color,border-color] duration-(--duration-spring) ease-spring not-data-disabled:active:scale-97',
    'before:absolute before:inset-0 before:-z-10',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'bg-accent text-on-accent before:bg-accent-hover',
      // The outline darkens with the fill, so the quieter fill still reads.
      secondary:
        'border border-line-strong bg-surface text-ink before:bg-surface-muted not-data-disabled:hover:border-ink',
      ghost: 'text-ink before:bg-surface-strong',
      // A tint, not solid red: the red label stays readable over the part the wipe hasn't reached yet.
      danger: 'border border-danger bg-surface text-danger before:bg-danger-muted',
    } satisfies Record<(typeof BUTTON_VARIANTS)[number], string>,
    size: {
      s: 'h-8 px-3 text-body-s',
      m: 'h-10 px-4 text-body-s',
    } satisfies Record<(typeof BUTTON_SIZES)[number], string>,
    hover: {
      wipe: [
        'before:origin-right before:scale-x-0',
        'before:transition-transform before:duration-(--duration-base) before:ease-standard',
        'not-data-disabled:hover:before:origin-left not-data-disabled:hover:before:scale-x-100 not-data-disabled:hover:before:duration-(--duration-slower)',
      ],
      fade: [
        'before:scale-90 before:opacity-0',
        'before:transition-[opacity,scale] before:duration-(--duration-base) before:ease-standard',
        'not-data-disabled:hover:before:scale-100 not-data-disabled:hover:before:opacity-100 not-data-disabled:hover:before:duration-(--duration-fast)',
      ],
    } satisfies Record<(typeof BUTTON_HOVERS)[number], string[]>,
    busy: {
      true: 'data-disabled:cursor-default data-disabled:opacity-100',
    },
    loading: {
      true: 'data-disabled:cursor-progress',
    },
  },
  defaultVariants: { variant: 'primary', size: 'm', hover: 'wipe', busy: false, loading: false },
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
