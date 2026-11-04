import { tv } from '@/lib/utils'

import { type ICON_SIZES } from './icon.const'

/** An icon's box. Its color is the text's (`currentColor`), so it follows the states of whatever holds it. */
export const icon = tv({
  base: 'shrink-0',
  variants: {
    size: {
      s: 'size-4',
      m: 'size-6',
      l: 'size-8',
    } satisfies Record<(typeof ICON_SIZES)[number], string>,
  },
  defaultVariants: { size: 's' },
})
