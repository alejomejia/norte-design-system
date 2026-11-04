'use client'

import { type ReactNode, useRef, useState } from 'react'

import { Icon, type IconName } from '@/components/icon'
import { toCSSVars } from '@/lib/utils'

import { TOOL_CALL_STATUS_LABELS, type TOOL_CALL_STATUSES } from './tool-call.const'
import { useElapsed } from './tool-call.hooks'
import { toolCallStyles } from './tool-call.styles'
import { formatElapsed, runningProgress } from './tool-call.utils'

export type ToolCallStatus = (typeof TOOL_CALL_STATUSES)[number]

export type ToolCallProps = {
  /** The tool's name as the agent calls it: `web_search`. */
  name: string
  /** What it was called with, in a few words: the query, the file, the URL. Truncated when it doesn't fit. */
  detail?: ReactNode
  /** `running` while it works, then `success` or `error`. */
  status: ToolCallStatus
  /** When the call started (`Date.now()`): the timer and the running fill count from it. */
  startedAt: number
  /** When it ended, for a call loaded already finished. Without it, the timer stops when `status` changes. */
  endedAt?: number
  /** The tool's icon while it runs. */
  icon?: IconName
  /** What screen readers hear after the name for each status. */
  statusLabels?: Record<ToolCallStatus, string>
  className?: string
}

/**
 * One tool call of an agent, as a chip: the tool, what it was called with, and how long it has taken. While it runs, a
 * light fill creeps across with the time, slowing down as it goes, since nobody knows when a call ends; when it ends,
 * the fill completes in the color of the outcome. Inspired by React Bits' Call Chip.
 *
 * @example
 * <ToolCall name="web_search" detail="design engineer roles" status="running" startedAt={call.startedAt} />
 */
export function ToolCall({
  name,
  detail,
  status,
  startedAt,
  endedAt,
  icon = 'tool',
  statusLabels = TOOL_CALL_STATUS_LABELS,
  className,
}: ToolCallProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const running = status === 'running'
  // A call that finishes without an end time stops its timer the moment it finishes. Adjusted while rendering, so the
  // timer never shows a frame past the end.
  const [stoppedAt, setStoppedAt] = useState<number>()
  if (!running && endedAt === undefined && stoppedAt === undefined) setStoppedAt(Date.now())
  if (running && stoppedAt !== undefined) setStoppedAt(undefined)
  const elapsed = useElapsed(ref, startedAt, running ? undefined : (endedAt ?? stoppedAt))
  const styles = toolCallStyles()

  return (
    <span
      ref={ref}
      data-running={running || undefined}
      data-success={status === 'success' || undefined}
      data-error={status === 'error' || undefined}
      className={styles.root({ className })}
    >
      <span
        aria-hidden="true"
        className={styles.fill()}
        style={toCSSVars({ progress: String(runningProgress(elapsed)) })}
      />
      <span aria-hidden="true" className={styles.icons()}>
        <Icon name={icon} className={styles.toolIcon()} />
        <Icon name="approve" className={styles.successIcon()} />
        <Icon name="close" className={styles.errorIcon()} />
      </span>
      <span className={styles.name()}>{name}</span>
      <span className="sr-only">, {statusLabels[status]}</span>
      {detail && <span className={styles.detail()}>{detail}</span>}
      <span className={styles.timer()}>{formatElapsed(elapsed)}</span>
    </span>
  )
}
