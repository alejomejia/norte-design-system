/** A duration as a timer shows it: `0.4s` and `9.9s` under ten seconds, `12s` under a minute, `1m 04s` after. */
export function formatElapsed(ms: number): string {
  const seconds = Math.max(0, ms) / 1000
  if (seconds < 10) return `${seconds.toFixed(1)}s`
  if (seconds < 60) return `${Math.floor(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${String(Math.floor(seconds % 60)).padStart(2, '0')}s`
}
