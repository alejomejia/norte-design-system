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
