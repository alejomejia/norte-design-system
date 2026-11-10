import { tv } from '@/lib/utils'

import { type UNDO_ACTION_TONES } from './undo-action.const'

/**
 * A done action with a way back: a row as wide as its container, the outcome at the start and an Undo button at the
 * end, and a thin bar under them that drains while the undo lasts. The bar is the timer (a CSS animation, on the compositor), so pausing it pauses the countdown: hovering or
 * focusing the row does. The row grows in from a little smaller as it appears, and leaves the same way, backwards, when
 * it's undone. Once it's committed, the box dissolves around the outcome: its edge and fill fade out, and so does the
 * button, so "Approved" stays where it was, as plain text, and nothing moves. A row that leaves instead (`afterCommit="leave"`)
 * fades, then a frame around it closes its height.
 */
export const undoActionStyles = tv({
  slots: {
    root: [
      'group relative flex h-10 w-full items-center gap-2 overflow-hidden rounded-m border border-line bg-surface pr-1 pl-3 text-body-s text-ink',
      'transition-[opacity,scale,background-color,border-color] duration-(--duration-appear) ease-enter starting:scale-96 starting:opacity-0',
    ],
    icon: '',
    label: 'min-w-0 flex-1 truncate pr-1',
    frame: 'w-full overflow-hidden',
    undo: 'transition-[opacity,translate] duration-(--duration-base) ease-exit',
    bar: [
      'absolute inset-x-0 bottom-0 h-0.5 origin-left animate-drain bg-accent [animation-duration:var(--duration)]',
      'group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]',
    ],
  },
  variants: {
    tone: {
      success: { icon: 'text-success' },
      neutral: { icon: 'text-ink-muted' },
    } satisfies Record<(typeof UNDO_ACTION_TONES)[number], object>,
    committed: {
      true: {
        root: 'border-transparent bg-transparent duration-(--duration-slow)',
        undo: 'translate-x-1 opacity-0',
      },
    },
  },
  defaultVariants: { tone: 'success' },
})
