/** Icon's sizes, so a spinner can take an icon's place: `s` (16px), `m` (24px) or `l` (32px). */
export const SPINNER_SIZES = ['s', 'm', 'l'] as const

/** What screen readers hear by default. Say what's loading when you can: "Loading results". */
export const SPINNER_LABEL = 'Loading'

/**
 * The stroke at each size, in the SVG's units (24 across): 2px on screen at every size, so a big spinner doesn't get
 * heavy.
 */
export const SPINNER_STROKE_WIDTHS = { s: 3, m: 2, l: 1.5 } as const satisfies Record<
  (typeof SPINNER_SIZES)[number],
  number
>
