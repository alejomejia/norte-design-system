import { tv } from '@/lib/utils'

/**
 * A one-time code: one slot per character, in groups split by a dash. A character typed or pasted into a slot drops the
 * last few pixels into place (`animate-settle`, once per fill); the slot being typed in takes the focus ring.
 */
export const codeFieldStyles = tv({
  slots: {
    root: 'flex flex-col gap-2',
    label: 'text-body-s font-medium text-ink',
    slots: 'flex items-center gap-2',
    slot: [
      'h-12 w-10 rounded-m border border-line-strong bg-surface text-center font-mono text-heading-s text-ink caret-accent',
      'transition-colors duration-(--duration-fast) hover:border-ink-subtle',
      'focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-focus',
      'data-filled:animate-settle data-filled:border-ink motion-reduce:animate-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    separator: 'h-px w-3 bg-line-strong',
  },
})
