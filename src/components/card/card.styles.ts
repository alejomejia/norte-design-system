import { tv } from '@/lib/utils'

import { type CARD_PADDINGS, type CARD_VARIANTS } from './card.const'

/**
 * A card: a surface whose parts stack with its padding between them. A border only, no shadow: elevation is for what
 * floats above the page. A card with a `Card.Link` is one link stretched over the whole card (its `::after`), so the
 * card itself reacts: a darker border or fill on hover, and the focus ring around it. Its action and footer sit above
 * that layer (`relative`), so their buttons stay clickable.
 */
export const cardStyles = tv({
  slots: {
    root: [
      'relative flex flex-col rounded-l text-body-s text-ink',
      'transition-colors duration-(--duration-fast) ease-standard',
      'has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-focus',
    ],
    header: 'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0.5',
    title: 'col-start-1 font-semibold text-ink',
    description: 'col-start-1 text-ink-muted',
    action: 'relative col-start-2 row-span-2 row-start-1 flex items-center gap-2',
    body: '',
    footer: 'relative flex flex-wrap items-center justify-end gap-2',
    link: 'outline-none after:absolute after:inset-0 after:rounded-l',
  },
  variants: {
    variant: {
      outline: { root: 'border border-line bg-surface has-[[data-card-link]:hover]:border-line-strong' },
      muted: { root: 'bg-surface-muted has-[[data-card-link]:hover]:bg-surface-strong' },
    } satisfies Record<(typeof CARD_VARIANTS)[number], object>,
    padding: {
      s: { root: 'gap-3 p-3' },
      m: { root: 'gap-4 p-4' },
      l: { root: 'gap-6 p-6' },
    } satisfies Record<(typeof CARD_PADDINGS)[number], object>,
  },
  defaultVariants: { variant: 'outline', padding: 'm' },
})
