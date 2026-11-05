import { tv } from '@/lib/utils'

import { type POPOVER_WIDTHS } from './popover.const'

/**
 * A popover: a panel that grows out of its trigger (from `--transform-origin`) and fades out, like Menu, with its parts
 * stacked 12px apart. The close button sits in the top corner; while it's there, the header leaves room for it.
 */
export const popoverStyles = tv({
  slots: {
    positioner: 'z-50 outline-none',
    popup: [
      'group/popover relative flex max-h-(--available-height) max-w-(--available-width) flex-col gap-3 overflow-y-auto',
      'origin-(--transform-origin) rounded-l border border-line bg-surface p-4 text-body-s text-ink shadow-m outline-none',
      'transition-[opacity,scale] duration-(--duration-fast) ease-standard',
      'data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
    ],
    header: 'flex flex-col gap-1 group-has-data-popover-close/popover:pr-8',
    title: 'font-semibold text-ink',
    description: 'text-ink-muted',
    close: 'absolute top-2 right-2',
  },
  variants: {
    width: {
      s: { popup: 'w-60' },
      m: { popup: 'w-80' },
      l: { popup: 'w-100' },
    } satisfies Record<(typeof POPOVER_WIDTHS)[number], object>,
  },
  defaultVariants: { width: 'm' },
})
