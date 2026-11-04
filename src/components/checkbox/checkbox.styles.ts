import { tv } from '@/lib/utils'

/**
 * A checkbox: a box that fills with the accent and draws its check, stroke by stroke, when checked. A press sinks it
 * a little and lets it spring back. The check is one path whose dash is its whole length (`pathLength="1"`): sliding
 * the dash draws it, so no layout moves.
 */
export const checkboxStyles = tv({
  slots: {
    label:
      'inline-flex cursor-pointer items-center gap-3 text-body-s text-ink select-none has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
    root: [
      'group grid size-4 shrink-0 cursor-pointer place-items-center rounded-s border border-line-strong bg-surface text-on-accent',
      'transition-[background-color,border-color,scale] duration-(--duration-spring) ease-spring',
      'not-data-disabled:hover:border-ink-subtle not-data-disabled:active:scale-90',
      'data-checked:border-accent data-checked:bg-accent data-indeterminate:border-accent data-indeterminate:bg-accent',
      'not-data-disabled:data-checked:hover:border-accent-hover not-data-disabled:data-checked:hover:bg-accent-hover',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
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
