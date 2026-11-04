import { type ReactNode } from 'react'

import { type BADGE_TONES } from './badge.const'
import { badgeStyles } from './badge.styles'

export type BadgeProps = {
  /** `neutral` for counts and labels, `accent` for what's selected or new, `success`, `warning` or `danger` for a state. */
  tone?: (typeof BADGE_TONES)[number]
  /** Shows a dot in the badge's tone before the label: a state at a glance. */
  dot?: boolean
  /** Pulses the dot, for a state that's still changing, like a run in progress. Implies `dot`. */
  live?: boolean
  /** The label: a word or two, or a number. */
  children: ReactNode
  className?: string
}

/**
 * A short label for a status or a count. Its color only repeats what the label says: never let it be the only thing
 * that tells a state apart.
 *
 * @example
 * <Badge tone="success" dot>Finished</Badge>
 */
export function Badge({ tone = 'neutral', dot = false, live = false, children, className }: BadgeProps) {
  const styles = badgeStyles({ tone, live })
  return (
    <span className={styles.root({ className })}>
      {(dot || live) && <span aria-hidden="true" className={styles.dot()} />}
      {children}
    </span>
  )
}
