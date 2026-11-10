import { type DataTableColumn, type DataTableSort, type DataTableSortValue } from './data-table.types'

// Text sorts the way people read it: "Kitewise 2" before "Kitewise 10", and case doesn't count.
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * The sort after a click on a column's header: ascending first, then descending, then back to the rows' own order.
 * @example
 * nextSort({ column: 'price', direction: 'ascending' }, 'price') // { column: 'price', direction: 'descending' }
 */
export function nextSort(sort: DataTableSort | null, column: string): DataTableSort | null {
  if (sort?.column !== column) return { column, direction: 'ascending' }
  return sort.direction === 'ascending' ? { column, direction: 'descending' } : null
}

/** Whether a sort value is missing, so it goes last whichever way the column runs. */
function isMissing(value: DataTableSortValue): value is null | undefined {
  return value === null || value === undefined
}

/** Two present sort values in ascending order: numbers by size, anything else as text. */
function compareValues(a: string | number, b: string | number) {
  return typeof a === 'number' && typeof b === 'number' ? a - b : collator.compare(String(a), String(b))
}

/**
 * The rows in the order a sort asks for. Rows with equal values keep their own order, and rows with no value go last
 * either way, so a source that failed never tops the list. With no sort, or a column that doesn't sort, it's `rows`.
 */
export function sortRows<Row>(
  rows: readonly Row[],
  columns: readonly DataTableColumn<Row>[],
  sort: DataTableSort | null,
): readonly Row[] {
  const sortValue = sort && columns.find((column) => column.id === sort.column)?.sortValue
  if (!sort || !sortValue) return rows
  const sign = sort.direction === 'ascending' ? 1 : -1
  return rows
    .map((row, index) => ({ row, index, value: sortValue(row) }))
    .sort((a, b) => {
      if (isMissing(a.value) || isMissing(b.value)) {
        if (isMissing(a.value) && isMissing(b.value)) return a.index - b.index
        return isMissing(a.value) ? 1 : -1
      }
      return compareValues(a.value, b.value) * sign || a.index - b.index
    })
    .map((entry) => entry.row)
}

/** How many of the rows are selected: all of them, some, or none. An empty table has none. */
export function selectionState(selected: readonly string[], rowIds: readonly string[]): 'all' | 'some' | 'none' {
  const chosen = new Set(selected)
  const count = rowIds.filter((id) => chosen.has(id)).length
  if (count === 0) return 'none'
  return count === rowIds.length ? 'all' : 'some'
}

/** The selection with one row added, or taken out if it was in. */
export function toggleRow(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((selectedId) => selectedId !== id) : [...selected, id]
}

/**
 * The selection after a click on the select-all checkbox: every row once all are in, or none of them if they already
 * were. Selected ids that aren't rows of this table stay, so a selection can outlive a filter.
 */
export function toggleAll(selected: readonly string[], rowIds: readonly string[]): string[] {
  const rows = new Set(rowIds)
  const others = selected.filter((id) => !rows.has(id))
  return selectionState(selected, rowIds) === 'all' ? others : [...others, ...rowIds]
}
