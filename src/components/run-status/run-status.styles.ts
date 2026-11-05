import { tv } from '@/lib/utils'

import { type RUN_STATUSES } from './run-status.const'

/**
 * A run's status as a row: a lattice of cells, the agent's name and what it's doing, and a stopwatch. While working,
 * the cells brighten in a wave from the top-left corner (opacity only, paused off-screen); otherwise they hold still in
 * the status's color.
 */
export const runStatusStyles = tv({
  slots: {
    root: 'flex min-w-0 items-center gap-3 text-body-s',
    lattice: 'grid shrink-0 grid-cols-3 gap-0.5',
    cell: 'size-1 bg-current',
    label: 'shrink-0 font-medium text-ink',
    detail: 'min-w-0 truncate text-ink-muted',
    timer: 'ml-auto shrink-0 pl-2 font-mono text-caption text-ink-subtle tabular-nums',
  },
  variants: {
    status: {
      working: {
        lattice: 'text-accent',
        cell: 'animate-glimmer [animation-delay:var(--delay)] in-data-paused:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:opacity-60',
      },
      waiting: { lattice: 'text-warning', cell: 'opacity-60' },
      done: { lattice: 'text-success' },
      failed: { lattice: 'text-danger', cell: 'opacity-60 even:opacity-100' },
    } satisfies Record<(typeof RUN_STATUSES)[number], object>,
  },
})
