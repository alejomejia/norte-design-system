/** Whether content is hidden past either end of a box that scrolls sideways. */
export type ScrollEdges = { start: boolean; end: boolean }

type InlineScroll = { scrollLeft: number; scrollWidth: number; clientWidth: number }

/**
 * Whether a sideways scroller hides content before its start and after its end. `scrollLeft` is negative in
 * right-to-left boxes, so only its distance from the start counts. A pixel of slack absorbs sub-pixel layouts.
 * @example
 * getScrollEdges(element) // { start: false, end: true } before scrolling a row that doesn't fit
 */
export function getScrollEdges({ scrollLeft, scrollWidth, clientWidth }: InlineScroll): ScrollEdges {
  const scrolled = Math.abs(scrollLeft)
  return { start: scrolled > 1, end: scrolled < scrollWidth - clientWidth - 1 }
}

/** The clear strip and the fade on a side of a `scroll-fade-x` row that hides content, in px: the utility's `4rem`. */
const SCROLL_FADE_WIDTH = 64

/**
 * How far, in px and which way, a chevron on a `scroll-fade-x` row scrolls it: a page, less the fades on both sides, so
 * an item half under one comes into full view. `direction` is `1` toward the end, `-1` back; in a right-to-left row
 * the end is to the left.
 * @example
 * scrollPageOffset(320, 1, 'ltr') // 192
 */
export function scrollPageOffset(clientWidth: number, direction: 1 | -1, writing: 'ltr' | 'rtl'): number {
  const page = Math.max(clientWidth - 2 * SCROLL_FADE_WIDTH, SCROLL_FADE_WIDTH)
  return direction * (writing === 'rtl' ? -1 : 1) * page
}

/**
 * Scrolls a `scroll-fade-x` row a page toward its end (`1`) or back (`-1`), from wherever it is. Client-only.
 * @example
 * scrollByPage(scrollerRef.current, 1)
 */
export function scrollByPage(element: HTMLElement | null, direction: 1 | -1): void {
  if (!element) return
  const writing = getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr'
  element.scrollBy({ left: scrollPageOffset(element.clientWidth, direction, writing) })
}
