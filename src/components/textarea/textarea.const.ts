/** A textarea's looks: `outline` in forms, `ghost` (no box, reading-size text) inside a surface that draws its own. */
export const TEXTAREA_VARIANTS = ['outline', 'ghost'] as const

/** How many lines a textarea shows when empty, by default. */
export const TEXTAREA_MIN_ROWS = 3

/** How many lines a textarea grows to before it scrolls, by default. */
export const TEXTAREA_MAX_ROWS = 8

/** How many characters left before the count starts telling screen readers. */
export const TEXTAREA_COUNT_WARNING = 20

/** The textarea's words: what screen readers hear near the limit. English defaults: pass `labels` to translate. */
export const TEXTAREA_LABELS = {
  remaining: (count: number) => (count === 1 ? '1 character left' : `${count} characters left`),
}
