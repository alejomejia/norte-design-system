'use client'

import { type RefObject, useEffect, useState } from 'react'

import { useInViewport } from '@/lib/hooks'

import { TOOL_CALL_TICK } from './tool-call.const'

/**
 * The time a call has taken, in ms: up to now while it runs, ticking every `TOOL_CALL_TICK` while the chip is on
 * screen, or up to `endedAt` once it's over.
 */
export function useElapsed(ref: RefObject<Element | null>, startedAt: number, endedAt?: number): number {
  const visible = useInViewport(ref)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endedAt !== undefined || !visible) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), TOOL_CALL_TICK)
    return () => window.clearInterval(timer)
  }, [endedAt, visible])

  return (endedAt ?? now) - startedAt
}
