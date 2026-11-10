'use client'

import { useRender } from '@base-ui/react/use-render'
import { type ComponentProps, type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'

import { Icon, type IconName } from '@/components/icon'
import { toCSSVars } from '@/lib/utils'

import { APPROVAL_REQUEST_PREVIEW_CLAMP } from './approval-request.const'
import { useApprovalRequest } from './approval-request.hooks'
import { approvalRequestStyles } from './approval-request.styles'

/** The parts read the slots only: their look doesn't depend on the request's state. */
const styles = approvalRequestStyles()

export type ApprovalRequestTitleProps = Omit<useRender.ComponentProps<'h3'>, 'className'> & {
  /** Another element, for the heading level that fits the page: `render={<h2 />}`. An `h3` by default. */
  render?: useRender.ComponentProps<'h3'>['render']
  className?: string
}

/** What the agent asks to do, as a question and a heading. It names the request. */
export function ApprovalRequestTitle({ render, className, ref, ...props }: ApprovalRequestTitleProps) {
  const { titleId } = useApprovalRequest()
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: { id: titleId, ...props, className: styles.title({ className }) },
  })
}

export type ApprovalRequestDetailProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** What the detail is, in a word: `To`, `From`, `Attachment`. Labels of every detail line up in one column. */
  label: ReactNode
  className?: string
}

/** One fact about the request, after its label: who it goes to, from where, what's attached. */
export function ApprovalRequestDetail({ label, children, className, ...props }: ApprovalRequestDetailProps) {
  return (
    <div {...props} className={styles.detail({ className })}>
      <span className={styles.detailLabel()}>{label}</span>
      <div className={styles.detailValue()}>{children}</div>
    </div>
  )
}

export type ApprovalRequestPreviewProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** Opens a long preview in full from the start. */
  defaultExpanded?: boolean
  className?: string
}

/**
 * What the agent will send or do, on a quiet fill: the email, the message, the change. A long one folds to about four
 * lines under a fade, with a button to open it; screen readers read it whole either way.
 */
export function ApprovalRequestPreview({
  defaultExpanded = false,
  children,
  className,
  ...props
}: ApprovalRequestPreviewProps) {
  const { labels } = useApprovalRequest()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [height, setHeight] = useState<number>()
  const contentRef = useRef<HTMLDivElement>(null)
  const clipId = useId()
  const rem = useRef(16)
  const clamps = height !== undefined && height > APPROVAL_REQUEST_PREVIEW_CLAMP * rem.current

  // The content's height, kept in step as it wraps: the fold opens to it, and it says whether there's anything to fold.
  // Measured before paint, so a short preview never flashes a button.
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    rem.current = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    function measure() {
      if (content) setHeight(content.offsetHeight)
    }
    measure()
    const resizes = new ResizeObserver(measure)
    resizes.observe(content)
    return () => resizes.disconnect()
  }, [])

  return (
    <div {...props} className={styles.preview({ className })}>
      <div
        id={clipId}
        data-expanded={expanded || undefined}
        data-clamped={(clamps && !expanded) || undefined}
        className={styles.previewClip()}
        style={toCSSVars({ 'preview-height': height === undefined ? undefined : `${height}px` })}
      >
        <div ref={contentRef} className={styles.previewContent()}>
          {children}
        </div>
      </div>
      {(clamps || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={clipId}
          onClick={() => setExpanded(!expanded)}
          className={styles.previewToggle()}
        >
          {expanded ? labels.showLess : labels.showAll}
          <Icon name="chevron-down" className={styles.previewChevron()} />
        </button>
      )}
    </div>
  )
}

export type ApprovalRequestNextProps = Omit<ComponentProps<'p'>, 'className'> & {
  /** The icon before it. */
  icon?: IconName
  className?: string
}

/** What happens once it's approved, in a line: where it goes from, how long there is to undo it. */
export function ApprovalRequestNext({ icon = 'info', children, className, ...props }: ApprovalRequestNextProps) {
  return (
    <p {...props} className={styles.next({ className })}>
      <span aria-hidden="true" className={styles.nextIcon()}>
        <Icon name={icon} />
      </span>
      <span>{children}</span>
    </p>
  )
}
