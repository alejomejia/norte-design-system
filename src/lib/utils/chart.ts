/**
 * How many ticks fit along an axis `length` px long with labels about `spacing` px apart: two at least, so an axis
 * always shows where it starts and ends.
 * @example
 * tickCount(240, 56) // 4
 */
export function tickCount(length: number, spacing: number): number {
  return Math.max(2, Math.floor(length / spacing))
}

/** A linear scale as d3 and visx make it: a function from a value to px, with its ticks. */
type TickScale = { (value: number): number; ticks: (count?: number) => number[] }

/**
 * The ticks for a horizontal axis whose labels never touch: the most that fit `length` px with `spacing` px each at
 * most, fewer while the widest label (`charWidth` px a character, plus `gap`) is wider than the space between two.
 * @example
 * fitTicks(xScale, 232, elapsed, { spacing: 56, charWidth: 7.5, gap: 16 }) // [0, 1, 2, 3, 4]
 */
export function fitTicks(
  scale: TickScale,
  length: number,
  format: (value: number) => string,
  { spacing, charWidth, gap }: { spacing: number; charWidth: number; gap: number },
): number[] {
  for (let count = tickCount(length, spacing); count > 2; count--) {
    const ticks = scale.ticks(count)
    const [first, second] = ticks
    if (first === undefined || second === undefined) return ticks
    const widest = Math.max(...ticks.map((tick) => format(tick).length)) * charWidth + gap
    if (Math.abs(scale(second) - scale(first)) >= widest) return ticks
  }
  return scale.ticks(2)
}
