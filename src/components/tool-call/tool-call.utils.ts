import { TOOL_CALL_PROGRESS_LIMIT, TOOL_CALL_PROGRESS_PACE } from './tool-call.const'

/** The decimals the progress keeps: far finer than a pixel, and few enough that every engine prints them alike. */
const PROGRESS_PRECISION = 10_000

/**
 * How much of the chip the running fill covers after `ms`: quick at first, then slower and slower, never reaching the
 * end. It shows that time passes without claiming a progress nobody knows. Rounded, since `Math.exp` can differ in its
 * last digit between engines: a server's Node and the browser would print different values, and React would report a
 * hydration mismatch on the fill.
 */
export function runningProgress(ms: number): number {
  const progress = TOOL_CALL_PROGRESS_LIMIT * (1 - Math.exp(-Math.max(0, ms) / TOOL_CALL_PROGRESS_PACE))
  return Math.round(progress * PROGRESS_PRECISION) / PROGRESS_PRECISION
}
