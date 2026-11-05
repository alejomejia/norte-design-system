'use client'

import { type RefObject, useEffect, useState } from 'react'

import { useInViewport } from './use-in-viewport'

/** How often a running timer updates, in ms. */
const TICK = 100

type ElapsedOptions = {
  /** Whether the timer runs. When it stops without an `endedAt`, it freezes at the moment it stopped. */
  running: boolean
  /** When the work ended, for something loaded already finished. */
  endedAt?: number
}

/**
 * The time since `startedAt`, in ms, for live timers (a tool call, an agent thinking). While running, it counts up to
 * now, ticking every 100ms while the element is on screen in a visible tab. Once stopped, it shows the time up to
 * `endedAt`, or up to the moment it stopped. Client-only.
 * @example
 * const elapsed = useElapsed(ref, call.startedAt, { running: call.status === 'running' })
 */
export function useElapsed(ref: RefObject<Element | null>, startedAt: number, { running, endedAt }: ElapsedOptions) {
  const visible = useInViewport(ref)
  const [now, setNow] = useState(() => Date.now())
  // Adjusted while rendering, so the timer never shows a frame past the moment it stopped.
  const [stoppedAt, setStoppedAt] = useState<number>()
  if (!running && endedAt === undefined && stoppedAt === undefined) setStoppedAt(Date.now())
  if (running && stoppedAt !== undefined) setStoppedAt(undefined)

  useEffect(() => {
    if (!running || !visible) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), TICK)
    return () => window.clearInterval(timer)
  }, [running, visible])

  return (running ? now : (endedAt ?? stoppedAt ?? now)) - startedAt
}
