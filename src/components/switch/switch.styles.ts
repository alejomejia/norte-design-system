import { tv } from '@/lib/utils'

/**
 * A switch: a track and a thumb that springs across it. Pressing stretches the thumb toward where it's going, like a
 * finger pushing it, before it moves. Transform and color only. The label, when there is one, wraps both, so clicking
 * it toggles the switch.
 */
export const switchStyles = tv({
  slots: {
    label:
      'inline-flex cursor-pointer items-center gap-3 text-body-s text-ink select-none has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
    root: [
      'group relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-1',
      'bg-line-strong transition-colors duration-(--duration-base) ease-standard data-checked:bg-accent',
      'not-data-disabled:hover:bg-ink-subtle not-data-disabled:data-checked:hover:bg-accent-hover',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    thumb: [
      'block size-4 origin-left rounded-full bg-white shadow-s',
      'transition-[translate,scale] duration-(--duration-spring) ease-spring',
      'data-checked:origin-right data-checked:translate-x-4',
      'group-not-data-disabled:group-active:scale-x-125',
    ],
  },
  variants: {
    // With a label, the label dims the control and its text together: the control doesn't dim twice.
    labelled: { true: { root: 'data-disabled:opacity-100' } },
  },
})
