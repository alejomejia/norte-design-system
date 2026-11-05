'use client'

import { type ReactNode, useState } from 'react'

import { Button } from '@/components/button'
import { Icon } from '@/components/icon'
import { toCSSVars } from '@/lib/utils'

import { UNDO_ACTION_DURATION } from './undo-action.const'
import { undoActionStyles } from './undo-action.styles'

export type UndoActionProps = {
  /** What was done, in a word or two: `Approved`. */
  children: ReactNode
  /** Called when the person undoes it, before the time runs out. The row disappears: show what was there before. */
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
  const [state, setState] = useState<'pending' | 'committed' | 'undone'>('pending')
  const committed = state === 'committed'
  const styles = undoActionStyles({ committed })

  if (state === 'undone') return null
  return (
    <div className={styles.root({ className })}>
      <Icon name="approve" className={styles.icon()} />
      <span role="status" className={styles.label()}>
        {children}
      </span>
      {!committed && (
        <>
          <Button
            variant="ghost"
            size="s"
            onClick={() => {
              setState('undone')
              onUndo()
            }}
          >
            {undoLabel}
          </Button>
          {/* The countdown: when its animation ends, the action commits. */}
          <span
            aria-hidden="true"
            className={styles.bar()}
            style={toCSSVars({ duration: `${duration}ms` })}
            onAnimationEnd={() => {
              setState('committed')
              onCommit?.()
            }}
          />
        </>
      )}
    </div>
  )
}
