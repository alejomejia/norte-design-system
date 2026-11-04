import { TOOL_CALL_PROGRESS_LIMIT, TOOL_CALL_PROGRESS_PACE } from './tool-call.const'

/**
 * How much of the chip the running fill covers after `ms`: quick at first, then slower and slower, never reaching the
 * end. It shows that time passes without claiming a progress nobody knows.
 */
export function runningProgress(ms: number): number {
  return TOOL_CALL_PROGRESS_LIMIT * (1 - Math.exp(-Math.max(0, ms) / TOOL_CALL_PROGRESS_PACE))
}
