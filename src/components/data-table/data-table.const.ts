/** Which way a sorted column runs: the values of `aria-sort`. */
export const DATA_TABLE_SORT_DIRECTIONS = ['ascending', 'descending'] as const

/** Where a column's content sits: `end` for numbers, so their digits line up. */
export const DATA_TABLE_ALIGNS = ['start', 'end'] as const

/** The select-all checkbox's default name. */
export const DATA_TABLE_SELECT_ALL_LABEL = 'Select all rows'

/** How many placeholder rows stand in while the rows load. */
export const DATA_TABLE_LOADING_ROWS = 5

/**
 * The widths of the loading bars, taken in turn across the cells, so the placeholder rows don't look stamped out. Five,
 * so a table of four columns never lines the same widths up in a column.
 */
export const DATA_TABLE_LOADING_WIDTHS = ['w-24', 'w-12', 'w-16', 'w-20', 'w-14'] as const

/** What screen readers hear after a header sorts its column, or stops sorting it (`direction` is `null`). */
export function dataTableSortAnnouncement(header: string, direction: 'ascending' | 'descending' | null) {
  return direction ? `Sorted by ${header}, ${direction}` : `No longer sorted by ${header}`
}
