import { TOOL_CALL_PROGRESS_LIMIT, TOOL_CALL_PROGRESS_PACE } from './tool-call.const'

/** A duration as a timer shows it: `0.4s` and `9.9s` under ten seconds, `12s` under a minute, `1m 04s` after. */
export function formatElapsed(ms: number): string {
  const seconds = Math.max(0, ms) / 1000
  if (seconds < 10) return `${seconds.toFixed(1)}s`
  if (seconds < 60) return `${Math.floor(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${String(Math.floor(seconds % 60)).padStart(2, '0')}s`
}

/**
 * How much of the chip the running fill covers after `ms`: quick at first, then slower and slower, never reaching the
 * end. It shows that time passes without claiming a progress nobody knows.
 */
export function runningProgress(ms: number): number {
  return TOOL_CALL_PROGRESS_LIMIT * (1 - Math.exp(-Math.max(0, ms) / TOOL_CALL_PROGRESS_PACE))
}
