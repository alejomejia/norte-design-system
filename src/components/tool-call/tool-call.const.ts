/** Where a tool call is: still running, finished, or failed. */
export const TOOL_CALL_STATUSES = ['running', 'success', 'error'] as const

/** What screen readers hear after the tool's name for each status. English defaults: pass `statusLabels` to translate. */
export const TOOL_CALL_STATUS_LABELS = {
  running: 'running',
  success: 'done',
  error: 'failed',
} as const

/** How often the timer of a running call updates, in ms. */
export const TOOL_CALL_TICK = 100

/** The time the running fill takes to cover about two thirds of the chip, in ms. It slows down from there. */
export const TOOL_CALL_PROGRESS_PACE = 4000

/** How far the running fill can go: it never reaches the end while the call runs, since nobody knows when it ends. */
export const TOOL_CALL_PROGRESS_LIMIT = 0.9
