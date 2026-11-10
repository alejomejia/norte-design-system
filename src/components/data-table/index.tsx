'use client'

import { type ComponentProps, type ReactNode, useId, useMemo, useRef, useState } from 'react'

import { Checkbox } from '@/components/checkbox'
import { Icon } from '@/components/icon'
import { Skeleton } from '@/components/skeleton'
import { useOverflows, useScrollEdges } from '@/lib/hooks'
import { cn } from '@/lib/utils'

import {
  DATA_TABLE_LOADING_ROWS,
  DATA_TABLE_LOADING_WIDTHS,
  DATA_TABLE_SELECT_ALL_LABEL,
  dataTableSortAnnouncement,
} from './data-table.const'
import { useRowGlide } from './data-table.hooks'
import { dataTableStyles } from './data-table.styles'
import { type DataTableColumn, type DataTableSort, type DataTableSortDirection } from './data-table.types'
import { nextSort, selectionState, sortRows, toggleAll, toggleRow } from './data-table.utils'

const NO_ROWS: readonly string[] = []

export type {
  DataTableColumn,
  DataTableSort,
  DataTableSortDirection,
  DataTableSortValue,
} from './data-table.types'

export type DataTableProps<Row> = Omit<ComponentProps<'div'>, 'className' | 'children'> & {
  /** What the table holds, in a sentence: screen readers name the table with it. Hidden unless `showCaption`. */
  caption: ReactNode
  /** Shows the caption above the table, for a table with no heading of its own. */
  showCaption?: boolean
  /** The columns, in order: each one's header, cells and how it sorts. */
  columns: readonly DataTableColumn<Row>[]
  /** The rows, in their own order: the one the table shows until a header sorts it, and goes back to. */
  rows: readonly Row[]
  /** A row's id: what `selectedRows` holds, and what keeps a row itself as it moves. */
  getRowId: (row: Row) => string
  /** Adds a checkbox to every row, and one in the header that selects them all. */
  selectable?: boolean
  /** The ids of the selected rows, to control the selection. */
  selectedRows?: readonly string[]
  /** The ids of the rows selected at first. */
  defaultSelectedRows?: readonly string[]
  /** The column and direction the rows are sorted by, or `null` for their own order, to control the sort. */
  sort?: DataTableSort | null
  /** The sort at first. */
  defaultSort?: DataTableSort | null
  /** Shows placeholder rows under the header while the rows load; sorting and selecting wait. */
  loading?: boolean
  /** How many placeholder rows stand in while loading: about as many as are coming. */
  loadingRows?: number
  /** What shows under the header when there are no rows: an `EmptyState`, usually `plain`. */
  empty?: ReactNode
  /** The select-all checkbox's name. */
  selectAllLabel?: string
  /** What screen readers hear after a header sorts its column, or stops sorting it (`direction` is `null`). */
  sortAnnouncement?: (header: string, direction: DataTableSortDirection | null) => string
  onSelectedRowsChange?: (selectedRows: string[]) => void
  onSortChange?: (sort: DataTableSort | null) => void
  /** Its size, like `max-h-80`: the rows scroll under the header once they don't fit. */
  className?: string
}

/**
 * Rows of records under headers that sort them, with an optional checkbox per row. It's a native table, so screen
 * readers move through it cell by cell and hear each row's header; every control is in the Tab order.
 *
 * @example
 * <DataTable
 *   caption="Seat prices for teams of 10 to 50 seats"
 *   rows={competitors}
 *   getRowId={(row) => row.id}
 *   columns={[
 *     { id: 'name', header: 'Competitor', cell: (row) => row.name, sortValue: (row) => row.name },
 *     { id: 'price', header: 'Seat price', cell: (row) => `$${row.price}`, sortValue: (row) => row.price, align: 'end' },
 *   ]}
 *   selectable
 * />
 */
export function DataTable<Row>({
  caption,
  showCaption = false,
  columns,
  rows,
  getRowId,
  selectable = false,
  selectedRows,
  defaultSelectedRows = [],
  sort,
  defaultSort = null,
  loading = false,
  loadingRows = DATA_TABLE_LOADING_ROWS,
  empty,
  selectAllLabel = DATA_TABLE_SELECT_ALL_LABEL,
  sortAnnouncement = dataTableSortAnnouncement,
  onSelectedRowsChange,
  onSortChange,
  className,
  ...props
}: DataTableProps<Row>) {
  const styles = dataTableStyles()
  const id = useId()
  const captionId = `${id}-caption`
  const scrollerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLTableSectionElement>(null)

  const [ownSort, setOwnSort] = useState(defaultSort)
  const currentSort = sort === undefined ? ownSort : sort
  const [ownSelected, setOwnSelected] = useState(defaultSelectedRows)
  const selected = selectedRows ?? ownSelected
  // Said once a header sorts, by a live region outside the table, which `aria-busy` would mute.
  const [announcement, setAnnouncement] = useState('')

  const sortedRows = useMemo(() => sortRows(rows, columns, currentSort), [rows, columns, currentSort])
  const order = useMemo(() => sortedRows.map(getRowId), [sortedRows, getRowId])
  const selection = selectionState(selected, order)
  const rowHeader = columns.find((column) => column.rowHeader) ?? columns[0]
  const span = columns.length + (selectable ? 1 : 0)

  // No rows to glide while their placeholders stand in: they're measured afresh once they arrive.
  useRowGlide(bodyRef, loading ? NO_ROWS : order)
  const edges = useScrollEdges(scrollerRef)
  const scrolls = useOverflows(scrollerRef, 'y')
  const scrollsSideways = useOverflows(scrollerRef, 'x')
  // A box that scrolls takes focus and a name, so the keyboard can scroll it too: but only while it does.
  const scrollable = scrolls || scrollsSideways

  function select(next: string[]) {
    if (selectedRows === undefined) setOwnSelected(next)
    onSelectedRowsChange?.(next)
  }

  function sortBy(column: DataTableColumn<Row>) {
    const next = nextSort(currentSort, column.id)
    if (sort === undefined) setOwnSort(next)
    onSortChange?.(next)
    setAnnouncement(sortAnnouncement(column.header, next?.direction ?? null))
  }

  function body() {
    if (loading) {
      return Array.from({ length: loadingRows }, (_, row) => row).map((row) => (
        // Placeholders never reorder, so their place is their identity.
        <tr key={row} className={styles.row()}>
          {selectable && (
            <td className={styles.selectCell()}>
              <Skeleton decorative>
                <Skeleton.Box className="size-4 rounded-s" />
              </Skeleton>
            </td>
          )}
          {columns.map((column, index) => (
            <td key={column.id} className={styles.cell({ className: column.className })}>
              <Skeleton decorative className={cn('flex', column.align === 'end' && 'justify-end')}>
                <Skeleton.Box
                  className={styles.loadingBar({
                    className: DATA_TABLE_LOADING_WIDTHS[(row + index) % DATA_TABLE_LOADING_WIDTHS.length],
                  })}
                />
              </Skeleton>
            </td>
          ))}
        </tr>
      ))
    }

    if (sortedRows.length === 0) {
      return empty ? (
        <tr>
          <td colSpan={span} className={styles.emptyCell()}>
            {empty}
          </td>
        </tr>
      ) : null
    }

    return sortedRows.map((row, index) => {
      const rowId = order[index] as string
      const isSelected = selected.includes(rowId)
      // By place, not by id: an id may hold spaces, which `aria-labelledby` reads as a list.
      const headerId = `${id}-row-${index}`
      return (
        <tr key={rowId} data-row-id={rowId} data-selected={isSelected || undefined} className={styles.row()}>
          {selectable && (
            <td className={styles.selectCell()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => select(toggleRow(selected, rowId))}
                aria-labelledby={headerId}
              />
            </td>
          )}
          {columns.map((column) => {
            const isRowHeader = column === rowHeader
            const Cell = isRowHeader ? 'th' : 'td'
            return (
              <Cell
                key={column.id}
                id={isRowHeader ? headerId : undefined}
                scope={isRowHeader ? 'row' : undefined}
                className={styles.cell({
                  align: column.align,
                  rowHeader: isRowHeader,
                  truncate: column.truncate,
                  className: column.className,
                })}
              >
                {column.cell(row)}
              </Cell>
            )
          })}
        </tr>
      )
    })
  }

  return (
    <div
      {...props}
      data-overflow-start={edges.start || undefined}
      data-overflow-end={edges.end || undefined}
      className={styles.root({ className })}
    >
      <div
        ref={scrollerRef}
        {...(scrollable && { tabIndex: 0, role: 'region', 'aria-labelledby': captionId })}
        className={styles.scroller()}
      >
        <table aria-busy={loading || undefined} className={styles.table()}>
          <caption id={captionId} className={showCaption ? styles.caption() : 'sr-only'}>
            {caption}
          </caption>
          <thead className={styles.head()}>
            <tr>
              {selectable && (
                // A plain cell, not a header: it holds a control, not a column's name.
                <td className={styles.selectCell()}>
                  <Checkbox
                    checked={selection === 'all'}
                    indeterminate={selection === 'some'}
                    disabled={loading || order.length === 0}
                    onCheckedChange={() => select(toggleAll(selected, order))}
                    aria-label={selectAllLabel}
                  />
                </td>
              )}
              {columns.map((column) => {
                const direction = currentSort?.column === column.id ? currentSort.direction : undefined
                const look = dataTableStyles({
                  align: column.align,
                  sortable: Boolean(column.sortValue),
                  sorted: direction ?? 'none',
                })
                const header = <span className={column.hideHeader ? 'sr-only' : undefined}>{column.header}</span>
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={direction}
                    className={look.headerCell({ className: column.className })}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => sortBy(column)}
                        className={look.sortButton()}
                      >
                        {header}
                        <Icon name="sort" className={look.sortIcon()} />
                      </button>
                    ) : (
                      header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          {/* A new body once the rows arrive, so they fade in over their placeholders. */}
          <tbody key={loading ? 'loading' : 'rows'} ref={bodyRef} className={styles.body()}>
            {body()}
          </tbody>
        </table>
      </div>
      <div role="status" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}
