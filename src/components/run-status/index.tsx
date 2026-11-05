'use client'

import { type ReactNode, useRef } from 'react'

import { useElapsed, useInViewport } from '@/lib/hooks'
import { formatElapsed, toCSSVars } from '@/lib/utils'

import { RUN_STATUS_GRID, RUN_STATUS_LABELS, RUN_STATUS_WAVE_STEP, type RUN_STATUSES } from './run-status.const'
import { runStatusStyles } from './run-status.styles'

export type RunStatusValue = (typeof RUN_STATUSES)[number]

export type RunStatusProps = {
  /** `working`, `waiting` for a person's approval, `done` or `failed`. */
  status: RunStatusValue
  /** Who is running: the agent's name. */
  label: ReactNode
  /** What it's doing right now, in a few words. Truncated when it doesn't fit. */
  detail?: ReactNode
  /** When the run started (`Date.now()`): the stopwatch counts from it. */
  startedAt: number
  /** When it ended, for a run loaded already finished. Without it, the stopwatch stops when the run stops working. */
  endedAt?: number
  /** What screen readers hear for each status. */
  statusLabels?: Record<RunStatusValue, string>
  className?: string
}

/** Each cell of the lattice, with its diagonal: cells on the same diagonal light up together. */
const CELLS = Array.from({ length: RUN_STATUS_GRID ** 2 }, (_, index) => ({
  index,
  diagonal: Math.floor(index / RUN_STATUS_GRID) + (index % RUN_STATUS_GRID),
}))

/**
 * What an agent is doing, in one row: a lattice that ripples while it works, its name, its current step and a
 * stopwatch. A live region, so screen readers hear the step and the status change (the stopwatch stays silent). Idea
 * from React Bits' Lattice Loader.
 *
 * @example
 * <RunStatus status="working" label="Research agent" detail="Visiting pricing pages" startedAt={run.startedAt} />
 */
export function RunStatus({
  status,
  label,
  detail,
  startedAt,
  endedAt,
  statusLabels = RUN_STATUS_LABELS,
  className,
}: RunStatusProps) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInViewport(ref)
  const working = status === 'working'
  const elapsed = useElapsed(ref, startedAt, { running: working || status === 'waiting', endedAt })
  const styles = runStatusStyles({ status })

  return (
    <div ref={ref} role="status" data-paused={!visible || undefined} className={styles.root({ className })}>
      <span aria-hidden="true" className={styles.lattice()}>
        {CELLS.map(({ index, diagonal }) => (
          <span
            key={index}
            className={styles.cell()}
            style={toCSSVars({ delay: `${diagonal * RUN_STATUS_WAVE_STEP}ms` })}
          />
        ))}
      </span>
      <span className={styles.label()}>{label}</span>
      <span className="sr-only">{statusLabels[status]}:</span>
      {detail && <span className={styles.detail()}>{detail}</span>}
      <span aria-hidden="true" className={styles.timer()}>
        {formatElapsed(elapsed)}
      </span>
    </div>
  )
}
