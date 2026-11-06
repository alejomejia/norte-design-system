import { tv } from '@/lib/utils'

/**
 * A breadcrumb's look. The path is quiet so the page's title stays the loudest thing in the top bar: ancestors rest in
 * muted ink and come up to ink on hover, with Link's standalone underline drawing in, and the current page sits in ink,
 * medium weight, as plain text. Slashes between them are a step lighter still.
 *
 * When the row runs out of room, items don't shrink (flexbox shrinks in proportion to width, which crushes a short
 * "Agents" to nothing first): they grow instead. Each starts at zero and takes an equal share of the room, stopping at
 * its own width, so short labels stay whole and long ones split what's left and truncate. The current page takes a
 * double share, so it stays readable longest. Items that may not truncate keep their width, and the others share the
 * rest. A cap in characters (`--breadcrumb-label-max`, unset by default) truncates long labels even when there's room.
 * The row keeps the height of the "…" button, so collapsing a path doesn't move the bar.
 */
export const breadcrumbStyles = tv({
  slots: {
    root: 'min-w-0 text-body-s',
    list: 'flex min-h-8 min-w-0 items-center gap-2',
    item: 'flex items-center gap-2',
    separator: 'flex shrink-0 items-center text-ink-subtle select-none',
    // Over Link's standalone look: muted, regular weight, and free to shrink (`*:` reaches its label) so it truncates.
    link: [
      'font-normal min-w-0 text-ink-muted *:min-w-0',
      'transition-colors duration-(--duration-base) ease-standard hover:text-ink',
    ],
    label: 'block',
    more: 'flex shrink-0 items-center gap-2',
  },
  variants: {
    /** Whether this item's label may truncate, from the root's `truncate`. */
    truncates: {
      true: {
        item: 'max-w-max min-w-0 grow basis-0 data-current:grow-2',
        label: 'max-w-(--breadcrumb-label-max) truncate',
      },
      false: { item: 'shrink-0', label: 'whitespace-nowrap' },
    },
    /** What the label is: a link's (colored by the link), a step with no page, or the current page. */
    kind: {
      link: {},
      text: { label: 'text-ink-muted' },
      current: { label: 'font-medium text-ink' },
    },
  },
  defaultVariants: { truncates: true, kind: 'link' },
})
