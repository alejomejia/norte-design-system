import { tv } from '@/lib/utils'

import { type DIALOG_SIZES } from './dialog.const'

/**
 * A dialog: a dimmed page and a panel centered over it, 16px from the edges of a small screen. It arrives with a fade, a
 * small rise and a grow, and leaves faster and simpler, a fade and a slight shrink: leaving shouldn't keep anyone
 * waiting. The panel has no padding of its own: its header is a soft gray band across the full width, clipped by the
 * rounded corners, and the body and footer pad themselves. When its content is too tall, only the body scrolls, edge to
 * edge, while the header and footer stay put. The close button sits in the header's corner; while it's there, the
 * header leaves room for it. On a small screen the footer's
 * buttons stack at full width, the main action on top.
 */
export const dialogStyles = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-50 bg-inverse/40',
      'transition-opacity duration-(--duration-slow) ease-standard',
      'data-ending-style:opacity-0 data-ending-style:duration-(--duration-base) data-starting-style:opacity-0',
    ],
    viewport: 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6',
    popup: [
      'group/dialog relative flex max-h-full max-w-full flex-col gap-6 overflow-hidden rounded-xl bg-surface pb-6 text-body-s text-ink shadow-l outline-none',
      'transition-[opacity,scale,translate] duration-(--duration-slow) ease-enter',
      'data-starting-style:translate-y-2 data-starting-style:scale-96 data-starting-style:opacity-0',
      'data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:duration-(--duration-base) data-ending-style:ease-exit',
    ],
    header: 'flex flex-col gap-1 bg-surface-muted px-6 py-4 group-has-data-dialog-close/dialog:pr-14',
    title: 'text-heading-s font-semibold text-ink',
    description: 'text-ink-muted',
    // 4px above and below too: it scrolls, so it would clip the focus ring of a control at its edge. While it scrolls it
    // takes focus itself, with its ring inside, where the panel's rounded corners don't clip it.
    body: [
      '-my-1 min-h-0 flex-1 overflow-y-auto px-6 py-1',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
    ],
    footer: 'flex flex-col-reverse gap-2 px-6 *:w-full sm:flex-row sm:justify-end sm:*:w-auto',
    close: 'absolute top-3 right-3',
  },
  variants: {
    size: {
      s: { popup: 'w-100' },
      m: { popup: 'w-128' },
      l: { popup: 'w-160' },
    } satisfies Record<(typeof DIALOG_SIZES)[number], object>,
  },
  defaultVariants: { size: 'm' },
})
