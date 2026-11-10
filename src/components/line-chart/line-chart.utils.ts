/**
 * A scale's domain that still has a span when every value is the same (one point, a flat run), so the scale can map
 * it: the value sits in the middle of a span of 2.
 * @example
 * spanOf([3, 3]) // [2, 4]
 */
export function spanOf(values: readonly number[]): [number, number] {
  if (values.length === 0) return [0, 1]
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? [min - 1, max + 1] : [min, max]
}

/** Where a value sits along an axis `length` px long showing `domain`; from the bottom up when `flipped` (a y axis). */
export function positionOf(value: number, domain: readonly [number, number], length: number, flipped = false): number {
  const along = ((value - domain[0]) / (domain[1] - domain[0])) * length
  return flipped ? length - along : along
}

/**
 * The scale and shift, along one axis, that take what's drawn for the `to` domain back to where it sat for the `from`
 * domain: `old px = new px × scale + shift`. Animating from it to none glides a drawing from its old place to its new
 * one, when a live chart scrolls or its axis grows.
 * @example
 * glideBetween([0, 4], [1, 5], 400) // { scale: 1, shift: 100 }: the line starts 100px right, where it was
 */
export function glideBetween(
  from: readonly [number, number],
  to: readonly [number, number],
  length: number,
  flipped = false,
): { scale: number; shift: number } {
  const scale = (to[1] - to[0]) / (from[1] - from[0])
  const shift = positionOf(to[0], from, length, flipped) - positionOf(to[0], to, length, flipped) * scale
  return { scale, shift }
}
