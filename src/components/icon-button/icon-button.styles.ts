import { tv } from '@/lib/utils'

import { type BUTTON_SIZES } from '../button/button.const'

/** An icon button's box: a square of the button's height, with no padding. Merged over the button's own classes. */
export const iconButton = tv({
  base: 'px-0',
  variants: {
    size: {
      s: 'w-8',
      m: 'w-10',
    } satisfies Record<(typeof BUTTON_SIZES)[number], string>,
  },
  defaultVariants: { size: 'm' },
})
