'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * Whether a measured size changed since the last render, so what glides when the data changes redraws in place while
 * the box resizes instead of trailing behind it. Client-only.
 * @example
 * const resizing = useResized(width) // `data-resizing` turns the transitions off for this render
 */
export function useResized(size: number): boolean {
  const previous = useRef(size)
  useLayoutEffect(() => {
    previous.current = size
  })
  return previous.current !== size
}
