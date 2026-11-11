import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Badge } from '@/components/badge'
import { Citation } from '@/components/citation'
import { EmptyState } from '@/components/empty-state'

import { DataTable, type DataTableColumn } from '.'

/** A competitor as run #128 found it: this quarter's seat price, last quarter's, and the page it read it on. */
type Competitor = {
  id: string
  name: string
  /** A seat a month for teams of 10 to 50 seats; `null` when its page couldn't be read. */
  price: number | null
  previous: number
  /** Off the yearly plan, in percent. */
  discount: number | null
  source?: { index: number; href: string; title: string }
}

/** What run #128 found, in the order it visited the pages. Orbit's timed out, so it has no price and no source. */
const COMPETITORS: Competitor[] = [
  {
    id: 'fieldnote',
    name: 'Fieldnote',
    price: 14,
    previous: 12,
    discount: 20,
    source: { index: 1, href: 'https://fieldnote.example/pricing', title: 'Fieldnote pricing' },
  },
  {
    id: 'brightloop',
    name: 'Brightloop',
    price: 16,
    previous: 15,
    discount: 15,
    source: { index: 2, href: 'https://brightloop.example/pricing', title: 'Pricing: plans for every team' },
  },
  {
    id: 'tandem',
    name: 'Tandem',
    price: 13,
    previous: 13,
    discount: 15,
    source: { index: 4, href: 'https://www.tandem.example/plans', title: 'Tandem plans and pricing' },
  },
  { id: 'orbit', name: 'Orbit', price: null, previous: 14, discount: null },
  {
    id: 'kitewise',
    name: 'Kitewise',
    price: 11,
    previous: 9,
    discount: 10,
    source: { index: 3, href: 'https://kitewise.example/pricing', title: 'Kitewise pricing' },
  },
]

/** How a competitor's seat price moved since last quarter, in dollars; `null` when it couldn't be read. */
function priceChange(row: Competitor) {
  return row.price === null ? null : row.price - row.previous
}

/** The change as a badge: the words say it, the tone repeats it. */
function changeBadge(row: Competitor) {
  const change = priceChange(row)
  if (change === null) return <Badge tone="danger">Couldn't read</Badge>
  if (change === 0) return <Badge>No change</Badge>
  return change > 0 ? (
    <Badge tone="warning" dot>
      Up ${change}
    </Badge>
  ) : (
    <Badge tone="success" dot>
      Down ${-change}
    </Badge>
  )
}

/** The Results tab's columns: the competitor, its seat price, how it moved, and the source it came from. */
function resultColumns(): DataTableColumn<Competitor>[] {
  return [
    { id: 'competitor', header: 'Competitor', cell: (row) => row.name, sortValue: (row) => row.name },
    {
      id: 'price',
      header: 'Seat price',
      cell: (row) => (row.price === null ? 'Unknown' : `$${row.price}`),
      sortValue: (row) => row.price,
      align: 'end',
    },
    { id: 'change', header: 'Change', cell: changeBadge, sortValue: priceChange },
    {
      id: 'source',
      header: 'Source',
      hideHeader: true,
      cell: (row) => row.source && <Citation {...row.source} />,
    },
  ]
}

/** The same, with each competitor's annual discount: wider than a side panel. */
function widerColumns(): DataTableColumn<Competitor>[] {
  const [competitor, price, change, source] = resultColumns() as [
    DataTableColumn<Competitor>,
    DataTableColumn<Competitor>,
    DataTableColumn<Competitor>,
    DataTableColumn<Competitor>,
  ]
  return [
    competitor,
    price,
    {
      id: 'discount',
      header: 'Annual discount',
      cell: (row) => (row.discount === null ? 'Unknown' : `${row.discount}%`),
      sortValue: (row) => row.discount,
      align: 'end',
    },
    change,
    source,
  ]
}

/** The competitors' names as the table lists them: its row headers, top to bottom. */
function rowOrder(table: HTMLElement) {
  return within(table)
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent)
}

const ORIGINAL_ORDER = COMPETITORS.map((row) => row.name)

const meta = {
  title: 'Data/Tables/Data table',
  component: DataTable<Competitor>,
  argTypes: {
    columns: { table: { disable: true } },
    rows: { table: { disable: true } },
    getRowId: { table: { disable: true } },
    empty: { table: { disable: true } },
    sort: { table: { disable: true } },
    defaultSort: { table: { disable: true } },
    selectedRows: { table: { disable: true } },
    defaultSelectedRows: { table: { disable: true } },
    sortAnnouncement: { table: { disable: true } },
    loadingRows: { control: { type: 'range', min: 1, max: 10 } },
  },
  args: {
    caption: 'Seat prices for teams of 10 to 50 seats',
    columns: resultColumns(),
    rows: COMPETITORS,
    getRowId: (row) => row.id,
    selectable: true,
    onSortChange: fn(),
    onSelectedRowsChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Rows of records under headers that sort them, with a checkbox per row when they can be selected. It's a native table, so screen readers move through it cell by cell and hear each row's header; rows glide to their new places as they sort. Its cells hold anything, like a badge or a citation.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <DataTable {...args} />
    </div>
  ),
} satisfies Meta<typeof DataTable<Competitor>>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ args, canvas, step }) => {
    const table = canvas.getByRole('table', { name: 'Seat prices for teams of 10 to 50 seats' })
    const price = canvas.getByRole('button', { name: 'Seat price' })
    const priceHeader = canvas.getByRole('columnheader', { name: 'Seat price' })
    const status = canvas.getByRole('status')

    await step('A table named by its caption, with a header per column and a row header per row', async () => {
      await expect(within(table).getAllByRole('columnheader')).toHaveLength(4)
      // Hidden from the eye, not from screen readers.
      await expect(canvas.getByRole('columnheader', { name: 'Source' })).toBeInTheDocument()
      await expect(rowOrder(table)).toEqual(ORIGINAL_ORDER)
      // Every row's checkbox is named by its row header.
      await expect(canvas.getByRole('checkbox', { name: 'Fieldnote' })).not.toBeChecked()
      await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).not.toBeChecked()
    })

    await step('A click on a header sorts ascending, with missing values last', async () => {
      await userEvent.click(price)
      await expect(priceHeader).toHaveAttribute('aria-sort', 'ascending')
      await expect(rowOrder(table)).toEqual(['Kitewise', 'Tandem', 'Fieldnote', 'Brightloop', 'Orbit'])
      await expect(args.onSortChange).toHaveBeenLastCalledWith({ column: 'price', direction: 'ascending' })
      await expect(status).toHaveTextContent('Sorted by Seat price, ascending')
    })

    await step('A second click sorts descending', async () => {
      await userEvent.click(price)
      await expect(priceHeader).toHaveAttribute('aria-sort', 'descending')
      await expect(rowOrder(table)).toEqual(['Brightloop', 'Fieldnote', 'Tandem', 'Kitewise', 'Orbit'])
      await expect(status).toHaveTextContent('Sorted by Seat price, descending')
    })

    await step('A third goes back to the rows’ own order', async () => {
      await userEvent.click(price)
      await expect(priceHeader).not.toHaveAttribute('aria-sort')
      await expect(rowOrder(table)).toEqual(ORIGINAL_ORDER)
      await expect(args.onSortChange).toHaveBeenLastCalledWith(null)
      await expect(status).toHaveTextContent('No longer sorted by Seat price')
    })

    await step('A row’s checkbox selects it, tints it, and leaves select-all mixed', async () => {
      const fieldnote = canvas.getByRole('checkbox', { name: 'Fieldnote' })
      const row = fieldnote.closest('tr') as HTMLElement
      const other = canvas.getByRole('checkbox', { name: 'Tandem' }).closest('tr') as HTMLElement
      await userEvent.click(fieldnote)
      await expect(fieldnote).toBeChecked()
      await expect(row).toHaveAttribute('data-selected')
      await expect(args.onSelectedRowsChange).toHaveBeenLastCalledWith(['fieldnote'])
      await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).toHaveAttribute('aria-checked', 'mixed')
      await waitFor(() =>
        expect(getComputedStyle(row).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor),
      )
    })

    await step('Select-all selects every row, then none', async () => {
      const all = canvas.getByRole('checkbox', { name: 'Select all rows' })
      await userEvent.click(all)
      await expect(all).toBeChecked()
      await expect(args.onSelectedRowsChange).toHaveBeenLastCalledWith([
        'fieldnote',
        'brightloop',
        'tandem',
        'orbit',
        'kitewise',
      ])
      await userEvent.click(all)
      await expect(all).not.toBeChecked()
      await expect(canvas.getByRole('checkbox', { name: 'Fieldnote' })).not.toBeChecked()
      await expect(args.onSelectedRowsChange).toHaveBeenLastCalledWith([])
    })
  },
}

/** Sorted from the start, by seat price: the arrow stays on its header. */
export const Sorted: Story = {
  args: { defaultSort: { column: 'price', direction: 'ascending' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('columnheader', { name: 'Seat price' })).toHaveAttribute('aria-sort', 'ascending')
    await expect(rowOrder(canvas.getByRole('table'))).toEqual([
      'Kitewise',
      'Tandem',
      'Fieldnote',
      'Brightloop',
      'Orbit',
    ])
  },
}

/** Two rows selected: their tint, and a select-all that's mixed. */
export const Selected: Story = {
  args: { defaultSelectedRows: ['fieldnote', 'kitewise'] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Fieldnote' })).toBeChecked()
    await expect(canvas.getByRole('checkbox', { name: 'Kitewise' })).toBeChecked()
    await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).toHaveAttribute('aria-checked', 'mixed')
  },
}

/** Without `selectable`: a table to read, still sortable. */
export const ReadOnly: Story = {
  args: { selectable: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('checkbox')).toBeNull()
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(4)
  },
}

/** While the rows load: placeholder rows under the header, which waits to sort or select. */
export const Loading: Story = {
  args: { loading: true, rows: [] },
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table')
    await expect(table).toHaveAttribute('aria-busy', 'true')
    await expect(within(table).queryAllByRole('rowheader')).toHaveLength(0)
    // The header row and five placeholder rows.
    await expect(within(table).getAllByRole('row')).toHaveLength(6)
    await expect(canvas.getByRole('button', { name: 'Seat price' })).toBeDisabled()
    await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).toHaveAttribute('aria-disabled', 'true')
  },
}

/** No rows yet: an empty state under the header says why. */
export const Empty: Story = {
  args: {
    rows: [],
    empty: (
      <EmptyState
        variant="plain"
        icon="search"
        title="No prices yet"
        description="Run #128 fills this table as it reads each competitor's pricing page."
      />
    ),
  },
  play: async ({ canvas }) => {
    // It fades in, like the rows it stands for.
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'No prices yet' })).toBeVisible())
    await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).toHaveAttribute('aria-disabled', 'true')
  },
}

/** In a box shorter than its rows (`max-h-40`): the rows scroll under the header, which stays at the top. */
export const Scrolling: Story = {
  args: { className: 'max-h-40' },
  play: async ({ canvas, step }) => {
    const region = canvas.getByRole('region', { name: 'Seat prices for teams of 10 to 50 seats' })

    await step('The box takes focus and a name, so the keyboard can scroll it', async () => {
      await expect(region).toHaveAttribute('tabindex', '0')
    })

    await step('Scrolled to the end, the header is still at the top', async () => {
      region.scrollTop = region.scrollHeight
      const header = canvas.getByRole('columnheader', { name: 'Competitor' })
      await waitFor(() => expect(header.getBoundingClientRect().top).toBeCloseTo(region.getBoundingClientRect().top, 0))
      region.scrollTop = 0
    })
  },
}

/** Too wide for its box, with an annual discount column: it scrolls sideways, fading out on the side that hides columns. */
export const Narrow: Story = {
  args: { columns: widerColumns() },
  render: (args) => (
    <div className="sb-box-m">
      <DataTable {...args} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const region = canvas.getByRole('region', { name: 'Seat prices for teams of 10 to 50 seats' })
    const root = region.parentElement as HTMLElement

    await step('It fades out at the end, where columns are hidden, and not at the start', async () => {
      await waitFor(() => expect(root).toHaveAttribute('data-overflow-end'))
      await expect(root).not.toHaveAttribute('data-overflow-start')
    })

    await step('The fade has no strip for chevrons: content shows right up to it', async () => {
      await expect(getComputedStyle(region).getPropertyValue('--scroll-fade-clear').trim()).toBe('0rem')
    })
  },
}

/** The keyboard: Tab goes through select-all, the sortable headers and each row's controls; Enter sorts, Space selects. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    const all = canvas.getByRole('checkbox', { name: 'Select all rows' })
    const competitor = canvas.getByRole('button', { name: 'Competitor' })

    await step('Tab reaches select-all first, with its ring', async () => {
      await userEvent.tab()
      await expect(all).toHaveFocus()
      await expect(getComputedStyle(all).outlineStyle).toBe('solid')
    })

    await step('Then the first header; Enter sorts by it, with its ring drawn inside the cell', async () => {
      await userEvent.tab()
      await expect(competitor).toHaveFocus()
      await expect(getComputedStyle(competitor).outlineStyle).toBe('solid')
      await userEvent.keyboard('{Enter}')
      await expect(canvas.getByRole('columnheader', { name: 'Competitor' })).toHaveAttribute('aria-sort', 'ascending')
      await expect(rowOrder(canvas.getByRole('table'))).toEqual([
        'Brightloop',
        'Fieldnote',
        'Kitewise',
        'Orbit',
        'Tandem',
      ])
    })

    await step('Past the other headers, the first row’s checkbox; Space selects it', async () => {
      await userEvent.tab()
      await userEvent.tab()
      await userEvent.tab()
      const brightloop = canvas.getByRole('checkbox', { name: 'Brightloop' })
      await expect(brightloop).toHaveFocus()
      await userEvent.keyboard(' ')
      await expect(brightloop).toBeChecked()
      await userEvent.keyboard(' ')
      await expect(brightloop).not.toBeChecked()
    })

    await step('Back on the header, Enter twice more returns the rows to their own order', async () => {
      competitor.focus()
      await userEvent.keyboard('{Enter}')
      await userEvent.keyboard('{Enter}')
      await expect(rowOrder(canvas.getByRole('table'))).toEqual(ORIGINAL_ORDER)
    })
  },
}
