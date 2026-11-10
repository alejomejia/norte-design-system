import { tv } from '@/lib/utils'

import { type DATA_TABLE_ALIGNS } from './data-table.const'

/*
 * A data table: plain, with hairlines between the rows and no frame, since it usually sits in a panel that has one.
 * Rows are 40px; the header is quieter caption text on the same height, and stays at the top while the rows scroll
 * under it. Its hairline is each header cell's own bottom border: the table's borders are separate (`border-separate`),
 * since collapsed borders belong to the table and scroll away from a sticky header.
 *
 * A hovered row fills with the muted surface, a selected one with the accent's tint, both over `base`. A sortable
 * header is a button the size of its cell, so it needs no hover fill beside its small text: its words turn to ink, and
 * an arrow fades in to say what a click does. Sorted, the arrow stays and turns over for descending. Rows glide to
 * their new places as they sort (`useRowGlide`), and the rows fade in over `appear` when they replace their
 * placeholders. A table too wide for its box scrolls sideways and fades out on each side that hides columns, with the
 * shared `scroll-fade-x`, here without its strip for chevrons.
 */
export const dataTableStyles = tv({
  slots: {
    // Its `data-overflow-*` attributes (from `useScrollEdges`) tell the scroller which sides fade.
    root: 'flex min-h-0 flex-col',
    scroller: [
      'min-h-0 scroll-fade-x overflow-y-auto [--scroll-fade-clear:0rem] [--scroll-fade-width:2rem]',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
    ],
    table: 'w-full border-separate border-spacing-0 text-body-s text-ink',
    caption: 'caption-top pb-3 text-start text-body-s text-ink-muted',
    head: 'sticky top-0 z-10 bg-surface',
    headerCell: 'h-10 border-b border-line px-3 align-middle text-caption font-medium whitespace-nowrap text-ink-muted',
    sortButton: [
      'group/sort flex h-10 w-full cursor-pointer items-center gap-1 rounded-s px-3',
      'transition-colors duration-(--duration-fast) ease-standard not-disabled:hover:text-ink',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus disabled:cursor-default',
    ],
    sortIcon: [
      'size-3 opacity-0 transition-[opacity,rotate] duration-(--duration-base) ease-standard',
      'group-focus-visible/sort:opacity-100 group-enabled/sort:group-hover/sort:opacity-100',
    ],
    // The fade in, as the rows replace their placeholders: the body mounts again when loading ends.
    body: 'transition-opacity duration-(--duration-appear) ease-standard starting:opacity-0',
    row: [
      'group/row transition-colors duration-(--duration-base) ease-standard',
      'not-data-selected:hover:bg-surface-muted data-selected:bg-accent-subtle',
    ],
    // The checkbox's own column: 12px before it, and the next cell's padding after.
    selectCell: 'h-10 w-0 border-b border-line ps-3 pe-0 align-middle group-last/row:border-b-0',
    cell: 'h-10 border-b border-line px-3 align-middle whitespace-nowrap group-last/row:border-b-0',
    emptyCell: 'p-0',
    loadingBar: 'h-3 rounded-s',
  },
  variants: {
    align: {
      start: { headerCell: 'text-start', cell: 'text-start' },
      end: { headerCell: 'text-end', cell: 'text-end tabular-nums', sortButton: 'flex-row-reverse' },
    } satisfies Record<(typeof DATA_TABLE_ALIGNS)[number], object>,
    sortable: { true: { headerCell: 'px-0' } },
    sorted: {
      none: { sortIcon: 'text-ink-subtle' },
      ascending: { sortButton: 'text-ink', sortIcon: 'opacity-100' },
      descending: { sortButton: 'text-ink', sortIcon: 'rotate-180 opacity-100' },
    },
    rowHeader: { true: { cell: 'font-medium' } },
    truncate: { true: { cell: 'truncate' } },
  },
  defaultVariants: { align: 'start', sortable: false, sorted: 'none', rowHeader: false, truncate: false },
})
