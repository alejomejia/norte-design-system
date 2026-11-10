import { tv } from '@/lib/utils'

/**
 * An approval request: a card with who asks and when, the request as its heading, labelled details, a preview on a
 * quiet fill and what happens next, then Reject and Approve. Answering hands the footer to Undo action: the buttons fade
 * out in place (they share one grid cell with it, so the footer keeps its height) while the undo row grows in; undoing
 * fades them back. Once the undo runs out, the row fades and the footer closes its height, while the badge turns to the
 * outcome's tone: the card ends at what happens next, and the outcome is said once, at the top. A long preview folds to about four lines under a fade, and
 * "Show all" opens it to its height on `slow`. With `appear`, a new request rises 8px and fades in on `appear`. Under
 * reduced motion, it all changes at once.
 */
export const approvalRequestStyles = tv({
  slots: {
    root: '',
    header: 'flex items-center gap-3',
    byline: 'flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2',
    agent: 'truncate font-medium',
    time: 'text-caption text-ink-muted tabular-nums',
    badge: 'transition-colors duration-(--duration-base) ease-standard',
    // The body and the footer, without a gap: the footer's space above it is its own, so it closes with it.
    content: 'flex flex-col',
    body: 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3',
    title: 'col-span-full text-body font-medium text-pretty text-ink',
    detail: 'col-span-full grid min-h-8 grid-cols-subgrid items-center',
    detailLabel: 'text-ink-muted',
    detailValue: 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1',
    preview: 'col-span-full flex flex-col items-start gap-2 rounded-m bg-surface-muted p-3',
    previewClip: [
      'relative max-h-24 w-full overflow-hidden transition-[max-height] duration-(--duration-slow) ease-standard',
      'data-expanded:max-h-(--preview-height)',
      // The fade into the fill, over the last line, while it's folded.
      'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-linear-to-b after:from-transparent after:to-surface-muted',
      'after:opacity-0 after:transition-opacity after:duration-(--duration-slow) after:ease-standard data-clamped:after:opacity-100',
    ],
    previewContent: 'flex flex-col gap-2',
    // A quiet text button, like Reasoning's fold: muted, up to ink on hover, its chevron turning as it opens.
    previewToggle: [
      'group inline-flex cursor-pointer items-center gap-1 rounded-s text-ink-muted select-none',
      'transition-colors duration-(--duration-fast) ease-standard hover:text-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    previewChevron: 'transition-transform duration-(--duration-base) ease-standard group-aria-expanded:rotate-180',
    next: 'col-span-full flex items-start gap-2 text-ink-muted',
    // As tall as a line, so the icon sits on the first one's middle.
    nextIcon: 'flex h-lh shrink-0 items-center',
    // Focused (by script only) when the buttons leave, so focus stays in the card without pausing the countdown. Its
    // space above closes in step with Undo action's height (`slow`, after a `fast` fade).
    footer: [
      'grid justify-items-end pt-4 outline-none',
      'transition-[padding] delay-(--duration-fast) duration-(--duration-slow) ease-standard',
    ],
    buttons: 'col-start-1 row-start-1 flex flex-wrap justify-end gap-2 transition-opacity duration-(--duration-base)',
    undo: 'col-start-1 row-start-1',
  },
  variants: {
    decided: {
      true: { buttons: 'opacity-0 ease-exit' },
      false: { buttons: 'ease-enter' },
    },
    final: { true: { footer: 'pt-0' } },
    appear: {
      true: {
        root: 'transition-[opacity,translate] duration-(--duration-appear) ease-enter starting:translate-y-2 starting:opacity-0',
      },
    },
  },
  defaultVariants: { decided: false, final: false, appear: false },
})
