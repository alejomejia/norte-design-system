'use client'

import { type ReactNode } from 'react'

import { Icon } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { Popover } from '@/components/popover'
import { Skeleton } from '@/components/skeleton'
import { nameParts } from '@/lib/utils'

import {
  type STAT_BETTER,
  STAT_LOADING_LABEL,
  type STAT_SIZES,
  STAT_TREND_LABELS,
  type STAT_TRENDS,
  type STAT_VARIANTS,
  statHelpLabel,
} from './stat.const'
import { useStatGroup } from './stat.hooks'
import { statStyles } from './stat.styles'
import { statChangeTone } from './stat.utils'
import { StatGroup } from './stat-group'

export type { StatGroupProps } from './stat-group'

export type StatTrend = (typeof STAT_TRENDS)[number]

export type StatProps = {
  /** What it measures, like "Cost". */
  label: string
  /** The number, formatted as it should read: "$0.84", "38.2k", "4m 12s". */
  value: ReactNode
  /** Which way it moved since the run it's compared with. Without it, there's no change line. */
  trend?: StatTrend
  /** How much it moved, as it should read: "$0.06", "12%". A `flat` trend shows "No change" without it. */
  change?: ReactNode
  /** Which way is good news: `down` for a cost or a duration. It colors the change; `none` leaves it muted. */
  better?: (typeof STAT_BETTER)[number]
  /** What it's compared with, after the change: "vs run #127". */
  comparison?: ReactNode
  /** A popover's content, opened from an info button after the label: start it with a `Popover.Header`. */
  help?: ReactNode
  /** The info button's name. Defaults to "About" and the label: "About cost". */
  helpLabel?: string
  /** Shows a skeleton in place of the value and the change. */
  loading?: boolean
  /** What screen readers hear while it loads, after the label. */
  loadingLabel?: string
  /** What screen readers hear for each direction; `flat`'s is shown too. */
  trendLabels?: Partial<Record<StatTrend, string>>
  /** `plain`, or `muted` on a tile of its own. Inside a `Stat.Group`, the group's. */
  variant?: (typeof STAT_VARIANTS)[number]
  /** `s` for panels, `m` for one that leads a page. Inside a `Stat.Group`, the group's. */
  size?: (typeof STAT_SIZES)[number]
  className?: string
}

/**
 * One number worth a glance, like a run's cost: its label, its value, and how it moved since a run before, colored by
 * whether that's good news. Several go in a `Stat.Group`.
 *
 * @example
 * <Stat label="Cost" value="$0.84" trend="down" change="$0.06" better="down" comparison="vs run #127" />
 */
function StatRoot({
  label,
  value,
  trend,
  change,
  better = 'up',
  comparison,
  help,
  helpLabel = statHelpLabel(label),
  loading = false,
  loadingLabel = STAT_LOADING_LABEL,
  trendLabels,
  variant,
  size,
  className,
}: StatProps) {
  const group = useStatGroup()
  const styles = statStyles({
    variant: variant ?? group?.variant,
    size: size ?? group?.size,
    tone: trend ? statChangeTone(trend, better) : undefined,
    changeLine: trend !== undefined,
  })
  const labels = { ...STAT_TREND_LABELS, ...trendLabels }
  // A stat is a term and its definitions: in a group, one entry of the group's list; alone, a list of its own.
  const Root = group ? 'div' : 'dl'

  return (
    <Root className={styles.root({ className })}>
      <dt className={styles.label()}>
        {label}
        {help !== undefined && (
          <Popover>
            <Popover.Trigger render={<IconButton icon="info" label={helpLabel} size="s" className={styles.help()} />} />
            <Popover.Popup align="start">{help}</Popover.Popup>
          </Popover>
        )}
      </dt>
      {loading ? (
        <dd>
          <Skeleton label={loadingLabel} className={styles.loading()}>
            <Skeleton.Box className={styles.valueBar()} />
            {trend && <Skeleton.Box className={styles.changeBar()} />}
          </Skeleton>
        </dd>
      ) : (
        <>
          <dd className={styles.value()}>{value}</dd>
          {trend && (
            <dd className={styles.change()}>
              <span className={styles.delta()}>
                <Icon name={`trend-${trend}`} className={styles.arrow()} />
                {trend === 'flat' && change === undefined ? (
                  labels.flat
                ) : (
                  <span>
                    <span className="sr-only">{labels[trend]} </span>
                    {change}
                  </span>
                )}
              </span>
              {comparison && <span className={styles.comparison()}>{comparison}</span>}
            </dd>
          )}
        </>
      )}
    </Root>
  )
}

// The root's name too: its function is `StatRoot`.
StatRoot.displayName = 'Stat'

export const Stat = Object.assign(StatRoot, nameParts('Stat', { Group: StatGroup }))
