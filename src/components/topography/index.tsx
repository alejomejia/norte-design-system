'use client'

import { useEffect, useRef, useState } from 'react'

import { useInViewport, useReducedMotion } from '@/lib/hooks'
import { readCssColor } from '@/lib/utils'

import { TOPOGRAPHY_STILL_TIME, type TOPOGRAPHY_TONES } from './topography.const'
import { topographyStyles } from './topography.styles'
import { createTopographyRenderer, type TopographyRenderer } from './topography.utils'

export type TopographyProps = {
  /** `dark`: a night survey map on a blue glow, for a cover. `light`: its lines alone, in the accent color, for a texture over a light surface. */
  tone?: (typeof TOPOGRAPHY_TONES)[number]
  /** How fast the terrain drifts: `1` is the cover's pace, `0.5` half as fast, for a calmer texture. */
  speed?: number
  /** Placed last: set the layer's opacity, like `opacity-10`, to keep the light lines a faint texture. */
  className?: string
}

/**
 * A live topographic map drifting north, Norte's name drawn as terrain: a cover behind a page's title, or a texture
 * behind a panel. A WebGL shader, so the GPU does the work and the page stays smooth. It draws only while on screen in
 * a visible tab, and shows one still map under reduced motion. Decorative: screen readers skip it.
 *
 * It fills its nearest positioned parent, behind that parent's content, so the parent needs `relative isolate`.
 *
 * @example
 * <header className="relative isolate overflow-hidden">
 *   <Topography />
 *   <h1>Runs</h1>
 * </header>
 */
export function Topography({ tone = 'dark', speed = 1, className }: TopographyProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<TopographyRenderer | null>(null)
  // Seconds the map has run, kept across pauses so it picks up where it stopped.
  const elapsedRef = useRef(TOPOGRAPHY_STILL_TIME)
  const [ready, setReady] = useState(false)
  const visible = useInViewport(rootRef)
  const reducedMotion = useReducedMotion()
  const styles = topographyStyles({ tone })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // The light tone's lines take the accent role, read once: a shader can't read CSS.
    const ink = readCssColor(canvas, 'var(--color-accent)')
    const renderer = createTopographyRenderer(canvas, tone, ink)
    if (!renderer) return
    rendererRef.current = renderer

    const observer = new ResizeObserver(() => {
      renderer.resize()
      renderer.draw(elapsedRef.current)
    })
    observer.observe(canvas)
    setReady(true)

    return () => {
      observer.disconnect()
      renderer.dispose()
      rendererRef.current = null
      setReady(false)
    }
  }, [tone])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !ready) return
    if (reducedMotion) {
      renderer.draw(TOPOGRAPHY_STILL_TIME)
      return
    }
    if (!visible) return

    let frame = 0
    let last = performance.now()
    function tick(now: number) {
      elapsedRef.current += ((now - last) / 1000) * speed
      last = now
      renderer?.draw(elapsedRef.current)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, reducedMotion, ready, speed])

  return (
    <div ref={rootRef} aria-hidden="true" className={styles.root({ className })}>
      {/* A new canvas per tone: a canvas keeps its first context's settings, and only the light tone is transparent. */}
      <canvas key={tone} ref={canvasRef} data-ready={ready || undefined} className={styles.canvas()} />
    </div>
  )
}
