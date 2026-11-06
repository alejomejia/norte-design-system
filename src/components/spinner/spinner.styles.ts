import { tv } from '@/lib/utils'

import { type SPINNER_SIZES } from './spinner.const'

/**
 * A faint ring with an arc that turns around it, growing and shrinking as it goes, in the color of the text around it.
 * It draws itself in as it appears: the ring traces around (`starting:`, a transition), and the arc's animation starts
 * from nothing, so it grows out of the line. Both loops are CSS (`spinner` and `spinner-arc` in `theme.css`); under
 * reduced motion the ring shows at once, and the arc holds its length and turns slowly.
 */
export const spinnerStyles = tv({
  slots: {
    root: 'inline-grid shrink-0 place-items-center',
    svg: 'size-full animate-spinner',
    track:
      'opacity-25 transition-[stroke-dashoffset] duration-(--duration-slower) ease-enter starting:[stroke-dashoffset:100]',
    arc: 'animate-spinner-arc',
  },
  variants: {
    size: {
      s: { root: 'size-4' },
      m: { root: 'size-6' },
      l: { root: 'size-8' },
    } satisfies Record<(typeof SPINNER_SIZES)[number], object>,
  },
  defaultVariants: { size: 's' },
})
