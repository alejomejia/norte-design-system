import { describe, expect, it } from 'vitest'

import { type DataTableColumn } from './data-table.types'
import { nextSort, selectionState, sortRows, toggleAll, toggleRow } from './data-table.utils'

type Row = { name: string; price: number | null }

const ROWS: Row[] = [
  { name: 'Fieldnote', price: 14 },
  { name: 'Brightloop', price: 16 },
  { name: 'Tandem', price: 13 },
  { name: 'Orbit', price: null },
  { name: 'kitewise', price: 14 },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Competitor', cell: (row) => row.name, sortValue: (row) => row.name },
  { id: 'price', header: 'Seat price', cell: (row) => row.price, sortValue: (row) => row.price },
  { id: 'source', header: 'Source', cell: () => null },
]

function names(rows: readonly Row[]) {
  return rows.map((row) => row.name)
}

describe('nextSort', () => {
  it('sorts a new column ascending', () => {
    expect(nextSort(null, 'price')).toEqual({ column: 'price', direction: 'ascending' })
    expect(nextSort({ column: 'name', direction: 'descending' }, 'price')).toEqual({
      column: 'price',
      direction: 'ascending',
    })
  })

  it('then descending, then back to no sort', () => {
    expect(nextSort({ column: 'price', direction: 'ascending' }, 'price')).toEqual({
      column: 'price',
      direction: 'descending',
    })
    expect(nextSort({ column: 'price', direction: 'descending' }, 'price')).toBeNull()
  })
})

describe('sortRows', () => {
  it('returns the rows as they are with no sort, or a column that does not sort', () => {
    expect(sortRows(ROWS, COLUMNS, null)).toBe(ROWS)
    expect(sortRows(ROWS, COLUMNS, { column: 'source', direction: 'ascending' })).toBe(ROWS)
    expect(sortRows(ROWS, COLUMNS, { column: 'missing', direction: 'ascending' })).toBe(ROWS)
  })

  it('sorts numbers by size, keeping equal rows in their own order either way', () => {
    expect(names(sortRows(ROWS, COLUMNS, { column: 'price', direction: 'ascending' }))).toEqual([
      'Tandem',
      'Fieldnote',
      'kitewise',
      'Brightloop',
      'Orbit',
    ])
    expect(names(sortRows(ROWS, COLUMNS, { column: 'price', direction: 'descending' }))).toEqual([
      'Brightloop',
      'Fieldnote',
      'kitewise',
      'Tandem',
      'Orbit',
    ])
  })

  it('puts missing values last whichever way it runs', () => {
    const ascending = sortRows(ROWS, COLUMNS, { column: 'price', direction: 'ascending' })
    const descending = sortRows(ROWS, COLUMNS, { column: 'price', direction: 'descending' })
    expect(ascending.at(-1)?.name).toBe('Orbit')
    expect(descending.at(-1)?.name).toBe('Orbit')
  })

  it('sorts text as people read it, case and digits included', () => {
    expect(names(sortRows(ROWS, COLUMNS, { column: 'name', direction: 'ascending' }))).toEqual([
      'Brightloop',
      'Fieldnote',
      'kitewise',
      'Orbit',
      'Tandem',
    ])
    const plans = [{ name: 'Plan 10' }, { name: 'Plan 2' }]
    const byName: DataTableColumn<{ name: string }>[] = [
      { id: 'name', header: 'Plan', cell: (row) => row.name, sortValue: (row) => row.name },
    ]
    expect(sortRows(plans, byName, { column: 'name', direction: 'ascending' }).map((plan) => plan.name)).toEqual([
      'Plan 2',
      'Plan 10',
    ])
  })

  it('leaves the rows it was given alone', () => {
    const before = names(ROWS)
    sortRows(ROWS, COLUMNS, { column: 'price', direction: 'ascending' })
    expect(names(ROWS)).toEqual(before)
  })
})

describe('selection', () => {
  const ids = ['fieldnote', 'brightloop', 'tandem']

  it('says whether all, some or none of the rows are selected', () => {
    expect(selectionState([], ids)).toBe('none')
    expect(selectionState(['tandem'], ids)).toBe('some')
    expect(selectionState(['tandem', 'fieldnote', 'brightloop'], ids)).toBe('all')
    expect(selectionState(['orbit'], ids)).toBe('none')
    expect(selectionState([], [])).toBe('none')
  })

  it('toggles one row in and out', () => {
    expect(toggleRow(['fieldnote'], 'tandem')).toEqual(['fieldnote', 'tandem'])
    expect(toggleRow(['fieldnote', 'tandem'], 'fieldnote')).toEqual(['tandem'])
  })

  it('selects every row, or none once all are in, keeping ids from elsewhere', () => {
    expect(toggleAll([], ids)).toEqual(ids)
    expect(toggleAll(['tandem'], ids)).toEqual(ids)
    expect(toggleAll(ids, ids)).toEqual([])
    expect(toggleAll(['orbit', ...ids], ids)).toEqual(['orbit'])
    expect(toggleAll(['orbit'], ids)).toEqual(['orbit', ...ids])
  })
})
