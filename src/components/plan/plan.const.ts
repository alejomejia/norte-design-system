/** Where a step of a plan is: not started, in progress, or done. */
export const PLAN_STEP_STATUSES = ['pending', 'active', 'done'] as const

/** What screen readers hear before each step. English defaults: pass `statusLabels` to translate. */
export const PLAN_STATUS_LABELS = {
  pending: 'To do',
  active: 'In progress',
  done: 'Done',
} as const

/** Lucide's check, drawn in a finished step's box. */
export const PLAN_CHECK_PATH = 'M20 6 9 17l-5-5'
