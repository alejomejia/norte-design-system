import { type STAT_BETTER, type STAT_TRENDS } from './stat.const'

/**
 * The tone of a stat's change: `success` when it moved the way that's better, `danger` when it moved the other way,
 * `neutral` when it didn't move or neither way is better. The arrow shows the direction; the tone says whether it's good.
 * @example
 * statChangeTone('down', 'down') // 'success': the cost went down
 */
export function statChangeTone(
  trend: (typeof STAT_TRENDS)[number],
  better: (typeof STAT_BETTER)[number],
): 'success' | 'danger' | 'neutral' {
  if (trend === 'flat' || better === 'none') return 'neutral'
  return trend === better ? 'success' : 'danger'
}
