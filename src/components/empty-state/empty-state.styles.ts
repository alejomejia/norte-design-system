import { tv } from '@/lib/utils'

import { type EMPTY_STATE_SIZES, type EMPTY_STATE_VARIANTS } from './empty-state.const'

/**
 * An empty state. As a card (`outline`), a white box with a topographic map across it as a faint texture (lines in ink
 * at 3%, index lines at 5%), so the empty space reads as a place, not as something broken; `dashed` and `plain` stay
 * clean, their border or their surround saying enough. On it, centered: an icon on an opaque tile, a
 * title in ink, a muted description and its actions. As it appears, the map fades in while the content rises 8px,
 * and the actions arrive just after (`starting:`, transitions). Under reduced motion, it all shows at once.
 */
export const emptyStateStyles = tv({
  slots: {
    root: 'relative isolate flex flex-col items-center overflow-hidden rounded-l text-center text-ink',
    contours: [
      'pointer-events-none absolute inset-0 -z-10 size-full',
      'transition-opacity duration-(--duration-appear) ease-standard starting:opacity-0',
    ],
    contour: 'stroke-ink/3',
    indexContour: 'stroke-ink/5',
    content: [
      'flex flex-col items-center',
      'transition-[opacity,translate] duration-(--duration-appear) ease-enter starting:translate-y-2 starting:opacity-0',
    ],
    lead: 'flex flex-col items-center',
    // Opaque, so the map stops at its edge.
    tile: 'grid shrink-0 place-items-center rounded-l border border-line bg-surface text-ink-muted',
    text: 'flex flex-col items-center gap-1',
    title: 'font-semibold text-ink',
    description: 'text-pretty text-ink-muted',
    actions: [
      'flex flex-wrap items-center justify-center gap-2',
      'transition-opacity delay-150 duration-(--duration-appear) ease-enter motion-reduce:delay-0 starting:opacity-0',
    ],
  },
  variants: {
    size: {
      s: {
        root: 'px-6 py-12',
        content: 'gap-6',
        lead: 'gap-4',
        tile: 'size-12',
        text: 'max-w-80',
        title: 'text-heading-s',
        description: 'text-body-s',
      },
      m: {
        root: 'px-8 py-20',
        content: 'gap-8',
        lead: 'gap-4',
        tile: 'size-16',
        text: 'max-w-md',
        title: 'text-heading-m',
        description: 'text-body',
      },
    } satisfies Record<(typeof EMPTY_STATE_SIZES)[number], object>,
    variant: {
      outline: { root: 'border border-line bg-surface' },
      dashed: { root: 'border border-dashed border-line-strong bg-surface' },
      plain: {},
    } satisfies Record<(typeof EMPTY_STATE_VARIANTS)[number], object>,
  },
  defaultVariants: { size: 's', variant: 'outline' },
})
