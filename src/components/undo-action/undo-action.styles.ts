import { tv } from '@/lib/utils'

/**
 * A done action with a way back: its outcome, an Undo button, and a thin bar under them that drains while the undo
 * lasts. The bar is the timer (a CSS animation, on the compositor), so pausing it pauses the countdown: hovering or
 * focusing the row does. Once it's committed, the bar and the button leave and the outcome stays.
 */
export const undoActionStyles = tv({
  slots: {
    root: 'group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-m border border-line bg-surface pr-1 pl-3 text-body-s text-ink',
    icon: 'text-success',
    label: 'pr-1',
    bar: [
      'absolute inset-x-0 bottom-0 h-0.5 origin-left animate-drain bg-accent [animation-duration:var(--duration)]',
      'group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]',
    ],
  },
  variants: {
    committed: { true: { root: 'pr-3' } },
  },
})
