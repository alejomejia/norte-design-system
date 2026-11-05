'use client'

import { type ReactNode, useRef } from 'react'

import { useInViewport } from '@/lib/hooks'

import { PLAN_CHECK_PATH, PLAN_STATUS_LABELS, type PLAN_STEP_STATUSES } from './plan.const'
import { planStyles } from './plan.styles'

export type PlanStepStatus = (typeof PLAN_STEP_STATUSES)[number]

export type PlanStep = {
  /** What the step does, in a sentence. */
  label: ReactNode
  status: PlanStepStatus
}

export type PlanProps = {
  /** The steps in order, each `pending`, `active` or `done`. Usually one is active at a time. */
  steps: PlanStep[]
  /** What screen readers hear before each step. */
  statusLabels?: Record<PlanStepStatus, string>
  className?: string
}

/**
 * The plan an agent follows, as a checklist it ticks off: each finished step fills its box, draws its check and is
 * struck through; the one in progress glows. It's a record, not a form: people don't check the steps. Idea from React
 * Bits' Spring Check, made calmer.
 *
 * @example
 * <Plan steps={[{ label: 'Read the brief', status: 'done' }, { label: 'Visit pricing pages', status: 'active' }]} />
 */
export function Plan({ steps, statusLabels = PLAN_STATUS_LABELS, className }: PlanProps) {
  const ref = useRef<HTMLOListElement>(null)
  const visible = useInViewport(ref)
  const styles = planStyles()

  return (
    <ol ref={ref} data-paused={!visible || undefined} className={styles.root({ className })}>
      {steps.map(({ label, status }, index) => (
        <li
          // Steps keep their place in a plan, so the position is their identity.
          key={index}
          aria-current={status === 'active' ? 'step' : undefined}
          data-active={status === 'active' || undefined}
          data-done={status === 'done' || undefined}
          className={styles.step()}
        >
          <span aria-hidden="true" className={styles.box()}>
            <span className={styles.dot()} />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={styles.check()}
            >
              <path d={PLAN_CHECK_PATH} pathLength={1} />
            </svg>
          </span>
          <span>
            <span className="sr-only">{statusLabels[status]}: </span>
            <span className={styles.label()}>{label}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
