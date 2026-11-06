/**
 * A duration as a timer shows it: `0.4s` and `9.9s` under ten seconds, `12s` under a minute, `1m 04s` after. With
 * `precise`, the tenths stay at every length (`12.4s`, `1m 04.2s`), for a clock that should visibly move.
 */
export function formatElapsed(ms: number, { precise = false }: { precise?: boolean } = {}): string {
  const seconds = Math.max(0, ms) / 1000
  if (seconds < 10 || (precise && seconds < 60)) return `${(Math.floor(seconds * 10) / 10).toFixed(1)}s`
  if (seconds < 60) return `${Math.floor(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return precise
    ? `${minutes}m ${(Math.floor(rest * 10) / 10).toFixed(1).padStart(4, '0')}s`
    : `${minutes}m ${String(Math.floor(rest)).padStart(2, '0')}s`
}
