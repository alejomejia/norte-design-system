'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Whether an element's content is taller than the element, so it scrolls. It updates as either one changes size, and
 * as children come and go. Client-only.
 * @example
 * const scrolls = useOverflows(bodyRef)
 * return <div ref={bodyRef} tabIndex={scrolls ? 0 : undefined} />
 */
export function useOverflows(ref: RefObject<HTMLElement | null>): boolean {
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function measure() {
      if (element) setOverflows(element.scrollHeight > element.clientHeight)
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

    observe()
    mutations.observe(element, { childList: true })
    return () => {
      resizes.disconnect()
      mutations.disconnect()
    }
  }, [ref])

  return overflows
}
