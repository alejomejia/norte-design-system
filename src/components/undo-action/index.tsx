'use client'

import { type ReactNode, useRef, useState } from 'react'

import { Button } from '@/components/button'
import { Icon } from '@/components/icon'
import { useReducedMotion } from '@/lib/hooks'
import { toCSSVars } from '@/lib/utils'

import { UNDO_ACTION_DURATION, UNDO_ACTION_LEAVE } from './undo-action.const'
import { undoActionStyles } from './undo-action.styles'

export type UndoActionProps = {
  /** What was done, in a word or two: `Approved`. */
  children: ReactNode
  /**
   * Called when the person undoes it, before the time runs out, once the row has faded away (a fifth of a second, at
   * once under reduced motion): show what was there before.
   */
  onUndo: () => void
  /** Called when the time runs out without an undo: now it's for real. */
  onCommit?: () => void
  /** How long the undo stays available, in ms. Hovering or focusing the row pauses it. */
  duration?: number
  /** The button's label. */
  undoLabel?: string
  className?: string
}

/**
 * A finished action that can still be taken back, for a moment: its outcome, an Undo button, and a bar that drains
 * until it commits. Kinder than a confirmation dialog for actions that are easy to reverse, like approving an agent's
 * step. Idea from React Bits' Fuse Button.
 *
 * @example
 * <UndoAction onUndo={() => setDecision(undefined)} onCommit={() => approve(step)}>Approved</UndoAction>
 */
export function UndoAction({
  children,
  onUndo,
  onCommit,
  duration = UNDO_ACTION_DURATION,
  undoLabel = 'Undo',
  className,
}: UndoActionProps) {
  const [state, setState] = useState<'pending' | 'committed' | 'leaving' | 'undone'>('pending')
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const committed = state === 'committed'
  const styles = undoActionStyles({ committed })

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

  if (state === 'undone') return null
  return (
    // Nothing in it answers while it leaves, so Undo can't run twice.
    <div ref={ref} inert={state === 'leaving'} className={styles.root({ className })}>
      <Icon name="approve" className={styles.icon()} />
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
          onAnimationEnd={() => {
            setState('committed')
            onCommit?.()
          }}
        />
      )}
    </div>
  )
}
