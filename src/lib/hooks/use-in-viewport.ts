'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Whether an element is worth animating: on screen, in a tab that's showing. Per-frame work (a canvas, a shader, a
 * timer) runs only while it's true. Client-only.
 * @example
 * const visible = useInViewport(canvasRef)
 */
export function useInViewport(ref: RefObject<Element | null>): boolean {
  const [onScreen, setOnScreen] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? false))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  useEffect(() => {
    function update() {
      setTabVisible(document.visibilityState === 'visible')
    }
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return onScreen && tabVisible
}
