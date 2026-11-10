import { tv } from '@/lib/utils'

/**
 * Source list: a fold under an agent's answer. Folded, it's one quiet row: the first sources' favicons overlapping, cut
 * apart by a ring in the surface color, then "5 sources" and, in danger, "1 failed", and a chevron pointing to the end.
 * Hovered, the label comes up to ink and the chevron nudges 2px the way it points, like Accordion.
 *
 * Open, the panel's height grows over `duration-slow` (the approval request below would jump otherwise; Base UI
 * measures it as `--collapsible-panel-height`), and the rows `rise` in one after another. They share their columns
 * through a subgrid, so numbers, titles and sites line up down the list: a number chip like Citation's (a failed source,
 * with nothing to cite, gets a cross), the favicon, the title, the site at the end, and an arrow that shows on hover.
 * A whole row is the link, so it hovers with a quiet `overlay` fill, and its number takes the accent as a citation does.
 * A failed row says why under its title, in danger.
 */
export const sourceListStyles = tv({
  slots: {
    root: 'flex flex-col text-body-s text-ink',
    trigger: [
      'group inline-flex min-h-8 w-fit cursor-pointer items-center gap-2 rounded-s text-ink-muted select-none',
      'transition-colors duration-(--duration-base) ease-standard enabled:hover:text-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    stack: 'isolate flex items-center',
    stackItem: 'relative ring-2 ring-surface not-first:-ml-1',
    label: 'flex items-center gap-1',
    failedCount: 'text-danger',
    chevron: [
      'shrink-0 -rotate-90 text-ink-subtle group-data-panel-open:rotate-0 rtl:rotate-90',
      'transition-[rotate,transform,color] duration-(--duration-slow) ease-standard',
      // A bracket: Tailwind's translate utilities set `translate`, which applies outside the rotation.
      'group-enabled:group-hover:[transform:translateY(0.125rem)] group-enabled:group-hover:text-ink',
    ],
    panel: [
      'group/panel h-(--collapsible-panel-height) overflow-hidden',
      'transition-[height] duration-(--duration-slow) ease-standard data-ending-style:h-0 data-starting-style:h-0',
    ],
    /*
     * The padding on a box of its own, so a closed panel reaches 0; it fades out faster than the height closes. The
     * bottom padding also holds the last row while it rises: Base UI measures the panel's scroll height as it opens,
     * and a row still 4px down would overflow a box without it, so the panel would snap back at the end.
     */
    list: [
      // A bracket: the five columns the rows share (number, favicon, title, site, arrow).
      'grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] py-2',
      'transition-opacity duration-(--duration-fast) ease-standard group-data-ending-style/panel:opacity-0',
    ],
    item: [
      'col-span-full grid grid-cols-subgrid',
      'animate-rise [animation-delay:var(--source-delay)] motion-reduce:animate-none',
    ],
    link: [
      'group/row col-span-full grid grid-cols-subgrid items-center gap-x-2 gap-y-0.5 rounded-m px-2 py-2',
      'transition-colors duration-(--duration-base) ease-standard hover:bg-overlay',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
    ],
    // Citation's marker, at rest and as it hovers.
    number: [
      'inline-flex h-4 min-w-4 items-center justify-center justify-self-center rounded-s px-1',
      'bg-surface-muted text-caption-s font-medium text-ink-muted tabular-nums',
      'transition-colors duration-(--duration-base) ease-standard',
      'group-hover/row:bg-accent-subtle group-hover/row:text-accent-ink',
      'group-focus-visible/row:bg-accent-subtle group-focus-visible/row:text-accent-ink',
    ],
    failedIcon: 'justify-self-center text-danger',
    title: 'truncate text-ink',
    domain: 'truncate text-end text-caption text-ink-subtle',
    arrow: [
      'text-ink-subtle opacity-0 transition-opacity duration-(--duration-base) ease-standard',
      'group-hover/row:opacity-100 group-focus-visible/row:opacity-100',
    ],
    // Under the title, from its column to the end.
    reason: 'col-start-3 col-end-6 text-caption text-danger',
  },
  variants: {
    failed: { true: { title: 'text-ink-muted' } },
  },
})
