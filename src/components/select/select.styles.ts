import { tv } from '@/lib/utils'

/*
 * A select: a field-like trigger, and a list that grows out of it (from `--transform-origin`). The highlight is one
 * shape that glides from row to row instead of jumping: the highlighted row names itself an anchor (CSS anchor
 * positioning) and the highlight follows it. It sits after the rows in the markup, as anchoring requires, and behind
 * them. Browsers without anchor positioning tint the highlighted row instead.
 */
export const selectStyles = tv({
  slots: {
    root: 'flex flex-col gap-2',
    label: 'text-body-s font-medium text-ink',
    trigger: [
      'group inline-flex h-10 min-w-48 cursor-pointer items-center justify-between gap-2 rounded-m border border-line-strong bg-surface px-3 text-body-s text-ink select-none',
      'transition-colors duration-(--duration-fast) not-data-disabled:hover:border-ink-subtle data-popup-open:border-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    value: 'truncate data-placeholder:text-ink-subtle',
    icon: 'flex text-ink-subtle transition-transform duration-(--duration-base) ease-standard group-data-popup-open:rotate-180',
    positioner: 'z-50 outline-none',
    popup: [
      'min-w-(--anchor-width) origin-(--transform-origin) rounded-l border border-line bg-surface p-1 shadow-m outline-none',
      'transition-[opacity,scale] duration-(--duration-fast) ease-standard',
      'data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
    ],
    list: 'group/list relative isolate flex flex-col outline-none',
    item: [
      'flex h-8 cursor-pointer items-center justify-between gap-6 rounded-s px-2 text-body-s text-ink outline-none select-none',
      'data-highlighted:[anchor-name:--nt-select-highlight]',
      'not-supports-[anchor-name:--nt]:data-highlighted:bg-surface-muted',
      'data-disabled:cursor-not-allowed data-disabled:text-ink-subtle',
    ],
    indicator: 'flex text-accent-ink',
    highlight: [
      'pointer-events-none absolute inset-x-0 -z-10 rounded-s bg-surface-muted opacity-0 group-has-data-highlighted/list:opacity-100',
      'top-[anchor(--nt-select-highlight_top,0)] h-[anchor-size(--nt-select-highlight_height,0)]',
      'transition-[top,height,opacity] duration-(--duration-base) ease-standard not-supports-[anchor-name:--nt]:hidden',
    ],
  },
  variants: {
    variant: {
      outline: {},
      // Borderless and as wide as its value, for toolbars: a prompt's model picker.
      ghost: {
        root: 'inline-flex',
        popup: 'min-w-56',
        trigger:
          'h-8 min-w-0 border-transparent px-2 text-ink-muted not-data-disabled:hover:border-transparent not-data-disabled:hover:bg-surface-muted not-data-disabled:hover:text-ink data-popup-open:border-transparent data-popup-open:bg-surface-muted',
      },
    },
  },
  defaultVariants: { variant: 'outline' },
})
