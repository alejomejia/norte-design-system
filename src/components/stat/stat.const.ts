/** A stat's sizes: `s` (an 18px value) for panels and rows of several, `m` (24px) for one that leads a page. */
export const STAT_SIZES = ['s', 'm'] as const

/** A stat's looks: `plain` on the surface around it, `muted` on a tile of its own, like a muted `Card`. */
export const STAT_VARIANTS = ['plain', 'muted'] as const

/** Which way a stat moved since the run it's compared with. */
export const STAT_TRENDS = ['up', 'down', 'flat'] as const

/** Which way is good news for a stat: `down` for a cost or a duration, `none` when neither is. */
export const STAT_BETTER = ['up', 'down', 'none'] as const

/** How many stats a group fits in a row. Three and four drop to one and two on a phone. */
export const STAT_COLUMNS = [1, 2, 3, 4] as const

/** What screen readers hear before the change, since the arrow says it only to the eye; `flat` is also shown. */
export const STAT_TREND_LABELS = { up: 'Up', down: 'Down', flat: 'No change' } as const

/** What screen readers hear while the value loads, after the stat's label. */
export const STAT_LOADING_LABEL = 'Loading'

/** The help button's default name, from the stat's label: "About cost". */
export function statHelpLabel(label: string) {
  return `About ${label.toLowerCase()}`
}
