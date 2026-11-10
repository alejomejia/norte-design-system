'use client'

import { type RefObject, useLayoutEffect, useRef } from 'react'

import { useReducedMotion } from '@/lib/hooks'
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

const GLIDE = {
  duration: MOTION_DURATION.base * 1000,
  easing: `cubic-bezier(${MOTION_EASE.standard.join(', ')})`,
} as const

/**
 * Glides a table's rows from their old places to their new ones when the order changes, so the eye can follow a row
 * through a sort. It runs when `order` changes, so keep it the same array between renders (`useMemo`). Each row is a
 * `tr` with `data-row-id`; it moves with a transform only, through the Web Animations API (Motion's layout animations
 * would bring its 38 KB `domMax`), and not at all under reduced motion. Client-only.
 * @example
 * const order = useMemo(() => rows.map(getRowId), [rows, getRowId])
 * useRowGlide(bodyRef, order)
 */
export function useRowGlide(bodyRef: RefObject<HTMLTableSectionElement | null>, order: readonly string[]) {
  const reducedMotion = useReducedMotion()
  // Where each row sat after the last change of order, from the top of the table (`offsetTop` ignores transforms).
  const tops = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const rows = new Map<string | undefined, HTMLTableRowElement>()
    for (const row of body.querySelectorAll<HTMLTableRowElement>(':scope > tr[data-row-id]')) {
      rows.set(row.dataset.rowId, row)
    }
    const previous = tops.current
    const next = new Map<string, number>()
    for (const id of order) {
      const row = rows.get(id)
      if (!row) continue
      const top = row.offsetTop
      next.set(id, top)
      const from = previous.get(id)
      if (reducedMotion || from === undefined || from === top) continue
      // A sort that interrupts a glide starts over from the row's old place: brief enough not to show.
      for (const animation of row.getAnimations()) animation.cancel()
      row.animate([{ transform: `translateY(${from - top}px)` }, { transform: 'none' }], GLIDE)
    }
    tops.current = next
  }, [bodyRef, order, reducedMotion])
}
