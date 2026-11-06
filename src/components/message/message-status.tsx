'use client'

import { useRef, useState } from 'react'

import { useElapsed, useInViewport } from '@/lib/hooks'
import { formatElapsed } from '@/lib/utils'

import { type MESSAGE_THINKING_EFFECTS } from './message.const'
import { messageStyles } from './message.styles'

type MessageStatusProps = {
  /** The word: "Thinking", "Writing". */
  label: string
  effect: (typeof MESSAGE_THINKING_EFFECTS)[number]
  /** Shows the clock after the word. */
  timer: boolean
  /** When the work started. Without it, the clock counts from when this status appeared. */
  since?: number
}

/**
 * What an agent's message header says while it works, in place of the time: a word that breathes or shimmers, and a
 * clock in tenths of a second that screen readers don't hear (the word says enough). It pauses off-screen.
 */
export function MessageStatus({ label, effect, timer, since }: MessageStatusProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInViewport(ref)
  const [appearedAt] = useState(() => Date.now())
  const elapsed = useElapsed(ref, since ?? appearedAt, { running: timer })
  const styles = messageStyles({ thinkingEffect: effect })

  return (
    <span ref={ref} data-paused={!visible || undefined} className={styles.status()}>
      <span className={styles.statusLabel()}>{label}</span>
      {timer && (
        <span aria-hidden="true" className={styles.statusTimer()}>
          {formatElapsed(elapsed, { precise: true })}
        </span>
      )}
    </span>
  )
}
