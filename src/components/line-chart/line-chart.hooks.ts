'use client'

import { type RefObject, useLayoutEffect, useRef } from 'react'

import { useReducedMotion } from '@/lib/hooks'
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

import { glideBetween, positionOf } from './line-chart.utils'

const GLIDE = {
  duration: MOTION_DURATION.slow * 1000,
  easing: `cubic-bezier(${MOTION_EASE.standard.join(', ')})`,
} as const

/** What the plot showed: its domains, its size in px and the ticks along each axis. */
export type LineChartFrame = {
  x: readonly [number, number]
  y: readonly [number, number]
  width: number
  height: number
  xTicks: readonly number[]
  yTicks: readonly number[]
}

/** Whether two domains are the same. */
function sameDomain(a: readonly [number, number], b: readonly [number, number]) {
  return a[0] === b[0] && a[1] === b[1]
}

/** Moves an element from `from` to its place, fading it in too when it's new there. */
function glide(element: Element, from: string, appears: boolean) {
  // An update that interrupts a glide starts over from the old place: brief enough not to show.
  for (const animation of element.getAnimations()) animation.cancel()
  element.animate(
    appears
      ? [
          { transform: from, opacity: 0 },
          { transform: 'none', opacity: 1 },
        ]
      : [{ transform: from }, { transform: 'none' }],
    GLIDE,
  )
}

/**
 * Glides the plot from what it showed to what it shows when the data changes, instead of redrawing it in a jump: the
 * line and its fill (`[data-glide="series"]`) move and stretch from their old places, and so do the ticks
 * (`[data-tick-x]`, `[data-tick-y]`, each holding its value), new ones fading in. A live chart scrolls by a step, and
 * an axis that grows makes room. A resize redraws in place. Transforms only, through the Web Animations API, and not at
 * all under reduced motion. Client-only.
 * @example
 * const frame = useMemo(() => ({ x: xDomain, y: yDomain, width, height, xTicks, yTicks }), [...])
 * useUpdateGlide(svgRef, frame)
 */
export function useUpdateGlide(ref: RefObject<SVGSVGElement | null>, frame: LineChartFrame) {
  const reducedMotion = useReducedMotion()
  const previous = useRef<LineChartFrame | null>(null)

  useLayoutEffect(() => {
    const before = previous.current
    previous.current = frame
    const svg = ref.current
    if (!svg || !before || reducedMotion) return
    if (before.width !== frame.width || before.height !== frame.height) return
    if (sameDomain(before.x, frame.x) && sameDomain(before.y, frame.y)) return

    const x = glideBetween(before.x, frame.x, frame.width)
    const y = glideBetween(before.y, frame.y, frame.height, true)
    for (const series of svg.querySelectorAll('[data-glide="series"]')) {
      glide(series, `matrix(${x.scale}, 0, 0, ${y.scale}, ${x.shift}, ${y.shift})`, false)
    }

    for (const tick of svg.querySelectorAll<SVGElement>('[data-tick-x]')) {
      const value = Number(tick.dataset.tickX)
      const shift = positionOf(value, before.x, frame.width) - positionOf(value, frame.x, frame.width)
      glide(tick, `translateX(${shift}px)`, !before.xTicks.includes(value))
    }
    for (const tick of svg.querySelectorAll<SVGElement>('[data-tick-y]')) {
      const value = Number(tick.dataset.tickY)
      const shift = positionOf(value, before.y, frame.height, true) - positionOf(value, frame.y, frame.height, true)
      glide(tick, `translateY(${shift}px)`, !before.yTicks.includes(value))
    }
  }, [ref, frame, reducedMotion])
}
