import { tv } from '@/lib/utils'

import { type SIDEBAR_COUNT_TONES } from './sidebar.const'

/**
 * Text that leaves when the sidebar collapses: it fades out at once, before the width closes over it, and back in
 * once the width has started to open, so a label is never seen squashed.
 */
const fades =
  'transition-opacity duration-(--duration-base) delay-(--duration-fast) ease-standard group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:delay-0 group-data-collapsed/sidebar:duration-(--duration-fast)'

/**
 * The sidebar: a column on the page, its header, navigation and footer, 240px wide, or 56px with icons alone. Its
 * width eases between the two, the one width animation in Norte: the page beside it reflows, and that's the point.
 * Every icon sits in the same 32px column at both widths, so nothing moves sideways but the edge. Rows rest muted and
 * come up to ink on a quiet fill when hovered; the current page keeps the fill and gains weight.
 */
export const sidebarStyles = tv({
  slots: {
    root: 'group/sidebar flex h-full w-60 shrink-0 flex-col overflow-hidden border-r border-line bg-canvas transition-[width] duration-(--duration-slow) ease-standard data-collapsed:w-14',
    header: 'flex flex-col gap-0.5 p-3',
    nav: 'flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-3 py-2',
    footer: 'flex flex-col gap-0.5 border-t border-line p-3',
    section: 'flex flex-col',
    // Collapsed, the heading keeps its height, so the rows below don't climb, and a hairline takes its place.
    sectionLabel:
      'relative flex h-8 items-center px-2 text-caption font-medium text-ink-subtle before:absolute before:inset-x-2 before:top-1/2 before:h-px before:bg-line before:opacity-0 before:transition-opacity before:duration-(--duration-base) before:ease-standard group-data-collapsed/sidebar:before:opacity-100',
    sectionLabelText: ['truncate', fades],
    list: 'flex flex-col gap-0.5',
  },
})

/** A row: a link to a page (`Item`) or a button (`Button`, `Toggle`), with its icon, label and what trails it. */
export const sidebarRowStyles = tv({
  slots: {
    row: 'group/row relative flex h-8 w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-m px-2 text-body-s text-ink-muted transition-colors duration-(--duration-fast) ease-standard select-none hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus data-current:bg-surface-muted data-current:font-medium data-current:text-ink data-popup-open:bg-surface-muted data-popup-open:text-ink',
    leading: 'relative grid size-4 shrink-0 place-items-center',
    label: ['min-w-0 flex-1 truncate text-left', fades],
    trailing: ['flex shrink-0 items-center', fades],
    // A count shrinks to a dot on the icon's corner when only the icon shows, cut out of whatever fill is behind it.
    dot: 'absolute -top-0.5 -right-0.5 size-2 rounded-full opacity-0 ring-2 ring-canvas transition-opacity duration-(--duration-base) ease-standard group-hover/row:ring-surface-muted group-data-collapsed/sidebar:opacity-100 group-data-current/row:ring-surface-muted',
  },
  variants: {
    // A 24px avatar or logo instead of an icon: less padding, so its center stays on the icons' column.
    media: {
      true: { row: 'px-1', leading: 'size-6' },
    },
    tone: {
      neutral: { dot: 'bg-ink-subtle' },
      accent: { dot: 'bg-accent' },
    } satisfies Record<(typeof SIDEBAR_COUNT_TONES)[number], object>,
  },
  defaultVariants: { media: false, tone: 'neutral' },
})
