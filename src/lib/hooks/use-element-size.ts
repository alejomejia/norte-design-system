'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * An element's inner size in px (`clientWidth`, `clientHeight`), kept up to date as it resizes: for what draws to fit
 * its box, like a chart. Both are `0` until the first measure, right after mount. Client-only.
 * @example
 * const { width, height } = useElementSize(boxRef)
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function measure() {
      if (!element) return
      const width = element.clientWidth
      const height = element.clientHeight
      // The same object when nothing changed, so a resize along the other axis doesn't render twice.
      setSize((size) => (size.width === width && size.height === height ? size : { width, height }))
    }

    // Measured now too: the observer's first report waits for the next rendered frame, which a busy or hidden page
    // can hold back.
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}
