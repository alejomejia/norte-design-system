import { tv } from '@/lib/utils'

import { type BUTTON_SIZES } from '../button/button.const'

/**
 * An icon button's box: a square of the button's height, with no padding. Merged over the button's own classes. A
 * ghost icon rests muted and darkens with the hover's fill, so a toolbar of them reads quieter than its text.
 */
export const iconButton = tv({
  base: 'px-0',
  variants: {
    size: {
      s: 'w-8',
      m: 'w-10',
    } satisfies Record<(typeof BUTTON_SIZES)[number], string>,
    ghost: {
      true: 'text-ink-muted not-data-disabled:hover:text-ink',
    },
  },
  defaultVariants: { size: 'm', ghost: false },
})
