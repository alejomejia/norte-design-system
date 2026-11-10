'use client'

import { type ComponentProps, type ReactNode, useMemo } from 'react'

import { type STAT_COLUMNS, type STAT_SIZES, type STAT_VARIANTS } from './stat.const'
import { StatGroupContext } from './stat.hooks'
import { statGroupStyles } from './stat.styles'

export type StatGroupProps = Omit<ComponentProps<'dl'>, 'className' | 'children'> & {
  /** How many stats fit in a row. Three and four drop to one and two on a phone. */
  columns?: (typeof STAT_COLUMNS)[number]
  /** The look of every stat in it: `plain`, or `muted` tiles. */
  variant?: (typeof STAT_VARIANTS)[number]
  /** The size of every stat in it. */
  size?: (typeof STAT_SIZES)[number]
  /** The `Stat`s. */
  children: ReactNode
  className?: string
}

/** Stats that belong together, like a run's duration, tokens, cost and tool calls: one list, laid out in a grid. */
export function StatGroup({ columns = 2, variant = 'plain', size = 's', className, ...props }: StatGroupProps) {
  const look = useMemo(() => ({ variant, size }), [variant, size])
  return (
    <StatGroupContext value={look}>
      <dl {...props} className={statGroupStyles({ variant, columns, className })} />
    </StatGroupContext>
  )
}
