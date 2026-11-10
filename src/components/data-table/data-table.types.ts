import { type ReactNode } from 'react'

import { type DATA_TABLE_ALIGNS, type DATA_TABLE_SORT_DIRECTIONS } from './data-table.const'

/** Which way a sorted column runs. */
export type DataTableSortDirection = (typeof DATA_TABLE_SORT_DIRECTIONS)[number]

/** The column the rows are sorted by, and which way. */
export type DataTableSort = { column: string; direction: DataTableSortDirection }

/** A value a column sorts by: numbers in order, text in the reader's language. Missing values go last. */
export type DataTableSortValue = string | number | null | undefined

/** One column of a data table: its header, what each row shows in it, and how it sorts. */
export type DataTableColumn<Row> = {
  /** Its key in `sort` and `onSortChange`. */
  id: string
  /** Its header, in a few words: also what announces its sorting. */
  header: string
  /** Hides the header from the eye, not from screen readers: for a column whose cells speak for themselves. */
  hideHeader?: boolean
  /** What a row shows in this column. */
  cell: (row: Row) => ReactNode
  /** What the column sorts by. A column without one doesn't sort. */
  sortValue?: (row: Row) => DataTableSortValue
  /** `end` for numbers, so their digits line up under the header. */
  align?: (typeof DATA_TABLE_ALIGNS)[number]
  /**
   * Makes this column's cells the rows' headers, which screen readers read before each cell and checkbox. The first
   * column is, unless another one says so.
   */
  rowHeader?: boolean
  /** Cuts long content short with an ellipsis instead of widening the table: give the column a `max-w-*` too. */
  truncate?: boolean
  /** Classes for the column's header and cells, like a width: `w-32`, `max-w-40`. */
  className?: string
}
