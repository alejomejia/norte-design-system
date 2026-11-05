import { tv } from '@/lib/utils'

/**
 * A checkbox: when checked, the accent wipes across the box from the left, like a button's hover, and the check draws
 * itself as the fill passes; unchecking sends the fill out to the right. The outline turns accent at once, so the box
 * reads as checked from the first frame. A press sinks it a little and lets it spring back. The check is one path whose
 * dash is its whole length (`pathLength="1"`): sliding the dash draws it, so no layout moves.
 */
export const checkboxStyles = tv({
  slots: {
    label:
      'inline-flex cursor-pointer items-center gap-3 text-body-s text-ink select-none has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
    root: [
      'group relative isolate grid size-4 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-s border border-line-strong bg-surface text-on-accent',
      'transition-transform duration-(--duration-spring) ease-spring not-data-disabled:active:scale-90',
      'not-data-disabled:hover:border-ink-subtle data-checked:border-accent data-indeterminate:border-accent',
      'before:absolute before:inset-0 before:-z-10 before:origin-right before:scale-x-0 before:bg-accent',
      'before:transition-[scale,background-color] before:duration-(--duration-base) before:ease-standard',
      'data-checked:before:origin-left data-checked:before:scale-x-100 data-indeterminate:before:origin-left data-indeterminate:before:scale-x-100',
      'not-data-disabled:data-checked:hover:border-accent-hover not-data-disabled:data-checked:hover:before:bg-accent-hover',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    // The check waits for the fill to reach the middle before it draws (`delay-100`); unchecking erases it at once.
    mark: [
      'col-start-1 row-start-1 size-3 [stroke-dasharray:1] [stroke-dashoffset:1]',
      'transition-[stroke-dashoffset] duration-(--duration-base) ease-enter',
    ],
  },
  variants: {
    // With a label, the label dims the control and its text together: the control doesn't dim twice.
    labelled: { true: { root: 'data-disabled:opacity-100' } },
  },
})
