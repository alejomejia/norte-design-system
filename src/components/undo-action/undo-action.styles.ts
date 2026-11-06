import { tv } from '@/lib/utils'

/**
 * A done action with a way back: its outcome, an Undo button, and a thin bar under them that drains while the undo
 * lasts. The bar is the timer (a CSS animation, on the compositor), so pausing it pauses the countdown: hovering or
 * focusing the row does. The row grows in from a little smaller as it appears, and leaves the same way, backwards, when
 * it's undone. Once it's committed, the box dissolves around the outcome: its edge and fill fade out, and so does the
 * button, so "Approved" stays where it was, as plain text, and nothing moves.
 */
export const undoActionStyles = tv({
  slots: {
    root: [
      'group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-m border border-line bg-surface pr-1 pl-3 text-body-s text-ink',
      'transition-[opacity,scale,background-color,border-color] duration-(--duration-appear) ease-enter starting:scale-96 starting:opacity-0',
    ],
    icon: 'text-success',
    label: 'pr-1',
    undo: 'transition-[opacity,translate] duration-(--duration-base) ease-exit',
    bar: [
      'absolute inset-x-0 bottom-0 h-0.5 origin-left animate-drain bg-accent [animation-duration:var(--duration)]',
      'group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]',
    ],
  },
  variants: {
    committed: {
      true: {
        root: 'border-transparent bg-transparent duration-(--duration-slow)',
        undo: 'translate-x-1 opacity-0',
      },
    },
  },
})
