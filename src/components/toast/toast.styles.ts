import { tv } from '@/lib/utils'

/*
 * The stack, after Sonner's: toasts pile up in the bottom-right corner, each one behind slightly smaller and peeking
 * out above the one in front; hovering or focusing the stack fans them out into a list. Base UI measures the toasts and
 * hands over the numbers as CSS variables (`--toast-index`, `--toast-offset-y`, `--toast-height`, the swipe movement),
 * and these classes do the math. Bracket values are the exception here: no utility exists for this geometry.
 */
export const toastStyles = tv({
  slots: {
    viewport: 'fixed right-4 bottom-4 z-50 w-88 max-w-[calc(100vw-2rem)]',
    root: [
      // How far each toast behind peeks out, the gap between fanned-out toasts, and how much smaller each one behind is.
      '[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-var(--toast-index)*0.06))] [--shrink:calc(1-var(--scale))]',
      '[--height:var(--toast-frontmost-height,var(--toast-height))]',
      'absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] h-(--height) w-full origin-bottom select-none',
      'rounded-l border border-line bg-surface text-ink shadow-m',
      // Stacked: each one behind rises by the peek and shrinks toward the bottom edge.
      'translate-x-(--toast-swipe-movement-x) translate-y-[calc(var(--toast-swipe-movement-y)_-_var(--toast-index)_*_var(--peek)_-_var(--shrink)_*_var(--height))] scale-(--scale)',
      'transition-[translate,scale,opacity,height] duration-(--duration-slower) ease-enter data-swiping:duration-0',
      // Fanned out: each toast sits above the ones in front, at its real height.
      'data-expanded:h-(--toast-height) data-expanded:scale-100',
      'data-expanded:translate-y-[calc(var(--toast-offset-y)_*_-1_-_var(--toast-index)_*_var(--gap)_+_var(--toast-swipe-movement-y))]',
      // In and out from below; swiped away in the direction of the swipe; past the limit, gone.
      'data-ending-style:translate-y-[150%] data-ending-style:opacity-0 data-limited:opacity-0 data-starting-style:translate-y-[150%]',
      'data-ending-style:data-[swipe-direction=right]:translate-x-[calc(var(--toast-swipe-movement-x)_+_150%)]',
      // Fills the gap between fanned-out toasts, so the pointer crossing it doesn't fold the stack.
      'after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full',
    ],
    content: [
      'flex items-start gap-3 overflow-hidden p-4 pr-12',
      'transition-opacity duration-(--duration-base) data-behind:opacity-0 data-expanded:opacity-100',
    ],
    icon: 'mt-0.5 shrink-0',
    text: 'flex min-w-0 flex-1 flex-col gap-1',
    title: 'text-body-s font-medium text-ink',
    description: 'text-body-s text-ink-muted',
    actions: 'mt-2 flex gap-2',
    action: [
      'inline-flex h-8 cursor-pointer items-center rounded-m border border-line-strong px-3 text-body-s font-medium text-ink',
      'transition-colors duration-(--duration-fast) hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    close: 'absolute top-3 right-3',
  },
})

/** Each type's icon color. */
export const TOAST_ICON_COLORS = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-ink-muted',
  loading: 'text-ink-muted',
} as const
