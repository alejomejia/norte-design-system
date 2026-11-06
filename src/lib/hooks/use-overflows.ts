'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Whether an element's content is larger than the element along an axis: taller (`y`, so it scrolls) or wider (`x`,
 * so a label truncates). It updates as either one changes size, and as children come and go. Client-only.
 * @example
 * const scrolls = useOverflows(bodyRef)
 * return <div ref={bodyRef} tabIndex={scrolls ? 0 : undefined} />
 */
export function useOverflows(ref: RefObject<HTMLElement | null>, axis: 'x' | 'y' = 'y'): boolean {
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function measure() {
      if (!element) return
      setOverflows(
        axis === 'x' ? element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight,
      )
    }

    // The element's own size, and each child's: content that grows inside a fixed box doesn't resize the box.
    const resizes = new ResizeObserver(measure)
    function observe() {
      resizes.disconnect()
      if (!element) return
      resizes.observe(element)
      for (const child of element.children) resizes.observe(child)
    }
    const mutations = new MutationObserver(observe)

    // Measured now too: the observer's first report waits for the next rendered frame, which a busy or hidden page
    // can hold back, leaving a truncated label without its tooltip until then.
    measure()
    observe()
    mutations.observe(element, { childList: true })
    return () => {
      resizes.disconnect()
      mutations.disconnect()
    }
  }, [ref, axis])

  return overflows
}
