/** An empty state's sizes: `s` inside a panel or a tab, `m` filling a page. */
export const EMPTY_STATE_SIZES = ['s', 'm'] as const

/**
 * An empty state's looks: `outline`, a card on a faint topographic map; `dashed`, a space that fills up; `plain`, no box,
 * for a surface that already frames it.
 */
export const EMPTY_STATE_VARIANTS = ['outline', 'dashed', 'plain'] as const

/** The icon on the tile, by size. */
export const EMPTY_STATE_ICON_SIZES = { s: 'm', m: 'l' } as const satisfies Record<
  (typeof EMPTY_STATE_SIZES)[number],
  'm' | 'l'
>
