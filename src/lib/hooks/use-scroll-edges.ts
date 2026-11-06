'use client'

import { type RefObject, useEffect, useState } from 'react'

import { getScrollEdges, type ScrollEdges } from '@/lib/utils'

const NO_EDGES: ScrollEdges = { start: false, end: false }

/**
 * Whether a box that scrolls sideways hides content before its start and after its end, to show a cue on that side.
 * It updates as the box scrolls, as either it or its content changes size, and as children come and go. Client-only.
 * @example
 * const edges = useScrollEdges(rowRef)
 * return <div ref={rowRef} data-overflow-end={edges.end || undefined} />
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdges {
  const [edges, setEdges] = useState(NO_EDGES)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function measure() {
      if (!element) return
      const next = getScrollEdges(element)
      // The same object when nothing changed, so scrolling only re-renders when a cue comes or goes.
      setEdges((current) => (current.start === next.start && current.end === next.end ? current : next))
    }

    // The box's own size, and each child's: content that grows inside a fixed box doesn't resize the box.
    const resizes = new ResizeObserver(measure)
    function observe() {
      resizes.disconnect()
      if (!element) return
      resizes.observe(element)
      for (const child of element.children) resizes.observe(child)
    }
    const mutations = new MutationObserver(observe)

    observe()
    mutations.observe(element, { childList: true })
    element.addEventListener('scroll', measure, { passive: true })
    return () => {
      resizes.disconnect()
      mutations.disconnect()
      element.removeEventListener('scroll', measure)
    }
  }, [ref])

  return edges
}
