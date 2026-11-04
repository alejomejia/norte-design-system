'use client'

import { Collapsible } from '@base-ui/react/collapsible'
import { type ReactNode, useRef, useState } from 'react'

import { Icon } from '@/components/icon'
import { useElapsed } from '@/lib/hooks'
import { formatElapsed } from '@/lib/utils'

import { REASONING_LABELS, type REASONING_STATUSES } from './reasoning.const'
import { reasoningStyles } from './reasoning.styles'

export type ReasoningStatus = (typeof REASONING_STATUSES)[number]

export type ReasoningProps = {
  /** `thinking` while the agent works through it, then `done`. */
  status: ReasoningStatus
  /** The steps so far, in order: a short line each. Add to the end as they come. */
  steps: ReactNode[]
  /** When the thinking started (`Date.now()`): the clock counts from it. */
  startedAt: number
  /** When it ended, for reasoning loaded already done. Without it, the clock stops when `status` changes. */
  endedAt?: number
  /** The header's words: while thinking, and once done with the time it took. */
  labels?: { thinking: string; done: (time: string) => string }
  className?: string
}

/**
 * How an agent reasoned its way to an answer. While it thinks, the header shimmers with a live clock and the steps
 * appear under it as they come; when it's done, the header becomes "Thought for 12s" and the steps fold away, a click
 * from coming back. Built on Base UI's Collapsible. Idea from React Bits' Thought Line.
 *
 * @example
 * <Reasoning status={run.thinking ? 'thinking' : 'done'} steps={run.steps} startedAt={run.startedAt} />
 */
export function Reasoning({ status, steps, startedAt, endedAt, labels = REASONING_LABELS, className }: ReasoningProps) {
  const ref = useRef<HTMLDivElement>(null)
  const thinking = status === 'thinking'
  const time = formatElapsed(useElapsed(ref, startedAt, { running: thinking, endedAt }))

  // Open while thinking, folded once done: it follows the status, and in between, the person's clicks.
  const [open, setOpen] = useState(thinking)
  const [previous, setPrevious] = useState(status)
  if (status !== previous) {
    setPrevious(status)
    setOpen(thinking)
  }

  const styles = reasoningStyles({ thinking })
  return (
    <Collapsible.Root ref={ref} open={open} onOpenChange={setOpen} className={styles.root({ className })}>
      <Collapsible.Trigger className={styles.trigger()}>
        <Icon name="ai" className={styles.icon()} />
        <span className={styles.label()}>{thinking ? labels.thinking : labels.done(time)}</span>
        {thinking && <span className={styles.timer()}>{time}</span>}
        <Icon name="chevron-down" className={styles.chevron()} />
      </Collapsible.Trigger>
      <Collapsible.Panel className={styles.panel()}>
        <ol className={styles.steps()}>
          {steps.map((step, index) => (
            // Steps are only ever added at the end, so a step's position is its identity.
            <li key={index} className={styles.step()}>
              {step}
            </li>
          ))}
        </ol>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
