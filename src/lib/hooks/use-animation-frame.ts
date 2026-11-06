'use client'

import { useEffect, useEffectEvent } from 'react'

import { subscribeToFrames } from './frame-loop'

/**
 * Calls `callback` every frame while `active`, with the frame's timestamp in ms, on one loop shared by every component
 * that uses it. Pair `active` with `useInViewport` and `useReducedMotion`, so the work stops off-screen, in hidden tabs
 * and for people who asked for less motion. Client-only.
 * @example
 * useAnimationFrame((now) => draw(context, now / 1000), live && visible && !reducedMotion)
 */
export function useAnimationFrame(callback: (now: number) => void, active: boolean) {
  const onFrame = useEffectEvent(callback)

  useEffect(() => {
    if (!active) return
    return subscribeToFrames((now) => onFrame(now))
  }, [active])
}
