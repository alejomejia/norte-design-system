/**
 * A number shortened for a glance: `13.4K`, `1.2M`, with at most one decimal, in the locale given (English by
 * default, so a server and a browser print the same).
 * @example
 * formatCompact(13_400) // '13.4K'
 */
export function formatCompact(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/**
 * The index of the value in a sorted list closest to `target`, by binary search; the earlier one on a tie, and `-1`
 * for an empty list.
 * @example
 * nearestIndex([0, 1, 2, 3], 1.4) // 1
 */
export function nearestIndex(sorted: readonly number[], target: number): number {
  if (sorted.length === 0) return -1
  let low = 0
  let high = sorted.length - 1
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if ((sorted[middle] as number) < target) low = middle
    else high = middle
  }
  return Math.abs(target - (sorted[low] as number)) <= Math.abs((sorted[high] as number) - target) ? low : high
}
