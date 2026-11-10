'use client'

import { type ReactNode, useRef, useState } from 'react'

import { Button } from '@/components/button'
import { Icon, type IconName } from '@/components/icon'
import { useReducedMotion } from '@/lib/hooks'
import { toCSSVars } from '@/lib/utils'

import {
  type UNDO_ACTION_AFTER_COMMIT,
  UNDO_ACTION_DURATION,
  UNDO_ACTION_GO,
  UNDO_ACTION_LEAVE,
  type UNDO_ACTION_TONES,
} from './undo-action.const'
import { undoActionStyles } from './undo-action.styles'

export type UndoActionProps = {
  /** What was done, in a word or two: `Approved`. It can change once committed: `Approved by you · 2:35 PM`. */
  children: ReactNode
  /**
   * Called when the person undoes it, before the time runs out, once the row has faded away (a fifth of a second, at
   * once under reduced motion): show what was there before.
   */
  onUndo: () => void
  /** Called when the time runs out without an undo: now it's for real. */
  onCommit?: () => void
  /**
   * What the row does once committed. `settle`: the box and the button fade away and the outcome stays, as plain text,
   * where it was. `leave`: the row fades out and closes its height, for when something else already shows the outcome
   * (a badge, a status).
   */
  afterCommit?: (typeof UNDO_ACTION_AFTER_COMMIT)[number]
  /** How long the undo stays available, in ms. Hovering or focusing the row pauses it. */
  duration?: number
  /** The button's label. */
  undoLabel?: string
  /** The icon before the outcome: a check by default, a cross for something declined. */
  icon?: IconName
  /** The icon's color: `success` for something done, `neutral` for something declined or removed. */
  tone?: (typeof UNDO_ACTION_TONES)[number]
  /** On the row, or with `afterCommit="leave"` on the frame around it, the outermost element either way. */
  className?: string
}

/**
 * A finished action that can still be taken back, for a moment: its outcome, an Undo button at the end of the row, and
 * a bar that drains until it commits. Kinder than a confirmation dialog for actions that are easy to reverse, like
 * approving an agent's step. Idea from React Bits' Fuse Button.
 *
 * @example
 * <UndoAction onUndo={() => setDecision(undefined)} onCommit={() => approve(step)}>Approved</UndoAction>
 */
export function UndoAction({
  children,
  onUndo,
  onCommit,
  afterCommit = 'settle',
  duration = UNDO_ACTION_DURATION,
  undoLabel = 'Undo',
  icon = 'approve',
  tone = 'success',
  className,
}: UndoActionProps) {
  const [state, setState] = useState<'pending' | 'committed' | 'leaving' | 'undone' | 'gone'>('pending')
  const ref = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const committed = state === 'committed'
  const leaves = afterCommit === 'leave'
  const styles = undoActionStyles({ committed, tone })

  function undo() {
    setState('leaving')
    // The row fades away before it's gone, so the switch back to what was there doesn't cut. The Web Animations API
    // tells when it's done, even when it takes no time.
    const leave = ref.current?.animate(UNDO_ACTION_LEAVE.keyframes, {
      ...UNDO_ACTION_LEAVE.timing,
      duration: reducedMotion ? 0 : UNDO_ACTION_LEAVE.timing.duration,
    })
    function done() {
      setState('undone')
      onUndo()
    }
    if (leave) leave.finished.then(done, done)
    else done()
  }

  function commit() {
    setState('committed')
    onCommit?.()
    if (leaves) go()
  }

  // Committed, with `leave`: the row fades, then its frame closes its height, so what's under it moves up smoothly
  // rather than jumping. The height closes at once under reduced motion: it moves the page.
  function go() {
    const row = ref.current
    const frame = frameRef.current
    function gone() {
      setState('gone')
    }
    if (!row || !frame) return gone()
    const fade = row.animate(UNDO_ACTION_GO.fade.keyframes, UNDO_ACTION_GO.fade.timing)
    const close = frame.animate(
      { height: [`${frame.offsetHeight}px`, '0px'] },
      reducedMotion ? { duration: 0, fill: 'forwards' } : UNDO_ACTION_GO.close.timing,
    )
    Promise.all([fade.finished, close.finished]).then(gone, gone)
  }

  if (state === 'undone' || state === 'gone') return null

  const row = (
    // Nothing in it answers while it leaves, so Undo can't run twice.
    <div ref={ref} inert={state === 'leaving'} className={styles.root({ className: leaves ? undefined : className })}>
      <Icon name={icon} className={styles.icon()} />
      <span role="status" className={styles.label()}>
        {children}
      </span>
      {/* Once committed, the button fades away but keeps its place, so nothing beside it moves. */}
      <Button variant="ghost" size="s" inert={committed} onClick={undo} className={styles.undo()}>
        {undoLabel}
      </Button>
      {/* The countdown: when its animation ends, the action commits. It goes as soon as Undo is pressed, so a countdown
          that ends while the row leaves can't commit it. */}
      {state === 'pending' && (
        <span
          aria-hidden="true"
          className={styles.bar()}
          style={toCSSVars({ duration: `${duration}ms` })}
          onAnimationEnd={commit}
        />
      )}
    </div>
  )

  // Only a row that leaves needs a frame: the box whose height closes, clipping the row as it does. It's the outermost
  // element then, so it takes `className`.
  return leaves ? (
    <div ref={frameRef} className={styles.frame({ className })}>
      {row}
    </div>
  ) : (
    row
  )
}
