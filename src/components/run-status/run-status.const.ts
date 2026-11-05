/** Where a run is: working, waiting for a person, done, or failed. */
export const RUN_STATUSES = ['working', 'waiting', 'done', 'failed'] as const

/** What screen readers hear for each status. English defaults: pass `statusLabels` to translate. */
export const RUN_STATUS_LABELS = {
  working: 'Working',
  waiting: 'Waiting for approval',
  done: 'Done',
  failed: 'Failed',
} as const

/** The lattice's side, in cells: a 3 × 3 grid. */
export const RUN_STATUS_GRID = 3

/** How much later each diagonal of the lattice lights up than the one before, in ms: the wave's speed. */
export const RUN_STATUS_WAVE_STEP = 120
