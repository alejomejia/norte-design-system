'use client'

import { type ComponentProps, type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'

import { Avatar, type AvatarProps } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { UndoAction } from '@/components/undo-action'
import { nameParts } from '@/lib/utils'

import {
  type APPROVAL_REQUEST_DECISIONS,
  APPROVAL_REQUEST_LABELS,
  APPROVAL_REQUEST_TIME_FORMAT,
} from './approval-request.const'
import { ApprovalRequestContext, type ApprovalRequestLabels } from './approval-request.hooks'
import { approvalRequestStyles } from './approval-request.styles'
import {
  ApprovalRequestDetail,
  ApprovalRequestNext,
  ApprovalRequestPreview,
  ApprovalRequestTitle,
} from './approval-request-parts'

export type { ApprovalRequestLabels } from './approval-request.hooks'
export type {
  ApprovalRequestDetailProps,
  ApprovalRequestNextProps,
  ApprovalRequestPreviewProps,
  ApprovalRequestTitleProps,
} from './approval-request-parts'

/** What a person answered. */
export type ApprovalRequestDecision = (typeof APPROVAL_REQUEST_DECISIONS)[number]

/** The agent that asks, as an agent `Avatar` takes it: its `name`, and its `effect` and `colors` if they're its own. */
export type ApprovalRequestAgent = Omit<
  Extract<AvatarProps, { kind: 'agent' }>,
  'kind' | 'size' | 'decorative' | 'className'
>

export type ApprovalRequestProps = Omit<ComponentProps<'article'>, 'className' | 'children' | 'ref'> & {
  /** Who asks. */
  agent: ApprovalRequestAgent
  /** When it asked. It reads as the hour and minute, in the reader's locale. */
  time?: Date
  /** Called once an approval can no longer be undone: now the agent goes ahead. */
  onApprove?: () => void
  /** Called once a rejection can no longer be undone. */
  onReject?: () => void
  /** An answer given before, for a request loaded from history: it opens settled, with nothing left to answer. */
  defaultDecision?: ApprovalRequestDecision
  /** How long an answer can be undone, in ms. */
  undoDuration?: number
  /** Fades in and rises as it mounts: for a request that just arrived, not for one loaded from history. */
  appear?: boolean
  /** Every string it shows or announces, to translate them. */
  labels?: Partial<ApprovalRequestLabels>
  /** `ApprovalRequest.Title`, then its `Detail`s, `Preview` and `Next`. */
  children: ReactNode
  className?: string
}

/**
 * An agent asking before it acts: who asks and when, what for, a preview of it and what happens next, with Reject and
 * Approve. An answer hands over to Undo action, so it can be taken back for a moment before `onApprove` or `onReject`
 * runs. An `article` named by its title, built on Card, Avatar, Badge and Button.
 *
 * @example
 * <ApprovalRequest agent={{ name: 'Research agent' }} time={request.time} onApprove={send}>
 *   <ApprovalRequest.Title>Send “Competitor pricing, Q3: what changed” to the leadership team?</ApprovalRequest.Title>
 *   <ApprovalRequest.Detail label="To">Leadership team · 6 people</ApprovalRequest.Detail>
 *   <ApprovalRequest.Preview>{email.body}</ApprovalRequest.Preview>
 *   <ApprovalRequest.Next>Sends from alejandro@norte.com.</ApprovalRequest.Next>
 * </ApprovalRequest>
 */
function ApprovalRequestRoot({
  agent,
  time,
  onApprove,
  onReject,
  defaultDecision,
  undoDuration,
  appear = false,
  labels: labelsProp,
  children,
  className,
  ...props
}: ApprovalRequestProps) {
  const titleId = useId()
  const labels = useMemo(() => ({ ...APPROVAL_REQUEST_LABELS, ...labelsProp }), [labelsProp])
  const context = useMemo(() => ({ titleId, labels }), [titleId, labels])

  const [decision, setDecision] = useState<ApprovalRequestDecision | undefined>(defaultDecision)
  // Once the undo has run out. An answer loaded from history is settled from the start, with nothing to undo.
  const [final, setFinal] = useState(false)
  const [fromHistory] = useState(defaultDecision !== undefined)
  const settled = fromHistory || final
  const styles = approvalRequestStyles({ decided: decision !== undefined, final, appear })

  const footerRef = useRef<HTMLDivElement>(null)
  const approveRef = useRef<HTMLButtonElement>(null)
  const rejectRef = useRef<HTMLButtonElement>(null)
  // Where focus goes once an answer or an undo has rendered. The buttons go inert as they fade, which would drop focus
  // to the page: an answer moves it to the footer, which isn't in the undo row, so the countdown isn't paused by it;
  // an undo brings it back to the button that was pressed.
  const focusNext = useRef<'footer' | ApprovalRequestDecision>(undefined)

  useEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = undefined
    if (target === 'footer') footerRef.current?.focus()
    else (target === 'approved' ? approveRef : rejectRef).current?.focus()
  }, [decision])

  function answer(next: ApprovalRequestDecision) {
    focusNext.current = 'footer'
    setDecision(next)
  }

  function undo() {
    focusNext.current = decision
    setDecision(undefined)
  }

  function commit() {
    setFinal(true)
    if (decision === 'approved') onApprove?.()
    else onReject?.()
  }

  const badge = {
    approved: { tone: 'success', label: labels.approved },
    rejected: { tone: 'neutral', label: labels.rejected },
    pending: { tone: 'warning', label: labels.pending },
  } as const
  // The badge keeps "Needs approval" while an answer can still be undone: the undo row says what was chosen. Once it's
  // final, the row leaves and the badge takes the outcome, so it's said in one place at a time.
  const { tone, label } = badge[settled && decision ? decision : 'pending']

  return (
    <ApprovalRequestContext value={context}>
      <Card {...props} render={<article aria-labelledby={titleId} />} className={styles.root({ className })}>
        <div className={styles.header()}>
          {/* Decorative: the name is written beside it. */}
          <Avatar {...agent} kind="agent" size="m" decorative />
          <div className={styles.byline()}>
            <span className={styles.agent()}>{agent.name}</span>
            {time && (
              // The server's locale and time zone may differ from the reader's: the client's reading wins.
              <time dateTime={time.toISOString()} suppressHydrationWarning className={styles.time()}>
                {time.toLocaleTimeString(undefined, APPROVAL_REQUEST_TIME_FORMAT)}
              </time>
            )}
          </div>
          <Badge tone={tone} dot className={styles.badge()}>
            {label}
          </Badge>
        </div>
        <div className={styles.content()}>
          <div className={styles.body()}>{children}</div>
          {!fromHistory && (
            <div ref={footerRef} tabIndex={-1} className={styles.footer()}>
              {/* Kept while the undo lasts, faded and inert, so undoing brings them back without a jump. */}
              {!final && (
                <div inert={decision !== undefined} className={styles.buttons()}>
                  <Button ref={rejectRef} variant="secondary" onClick={() => answer('rejected')}>
                    {labels.reject}
                  </Button>
                  <Button ref={approveRef} onClick={() => answer('approved')}>
                    {labels.approve}
                  </Button>
                </div>
              )}
              {decision && (
                <UndoAction
                  key={decision}
                  afterCommit="leave"
                  icon={decision === 'approved' ? 'approve' : 'close'}
                  tone={decision === 'approved' ? 'success' : 'neutral'}
                  duration={undoDuration}
                  undoLabel={labels.undo}
                  onUndo={undo}
                  onCommit={commit}
                  className={styles.undo()}
                >
                  {labels[decision]}
                </UndoAction>
              )}
            </div>
          )}
        </div>
      </Card>
    </ApprovalRequestContext>
  )
}

// The root's name too: its function is `ApprovalRequestRoot`.
ApprovalRequestRoot.displayName = 'ApprovalRequest'

export const ApprovalRequest = Object.assign(
  ApprovalRequestRoot,
  nameParts('ApprovalRequest', {
    Title: ApprovalRequestTitle,
    Detail: ApprovalRequestDetail,
    Preview: ApprovalRequestPreview,
    Next: ApprovalRequestNext,
  }),
)
