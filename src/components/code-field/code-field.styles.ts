import { tv } from '@/lib/utils'

/**
 * A one-time code: one slot per character, in groups split by a dash, inside the shared field frame (label,
 * description, error). A character typed or pasted into a slot drops the last few pixels into place (`animate-settle`,
 * once per fill); the slot being typed in takes the focus ring. An invalid code turns every slot's border red and shakes
 * the row once (`animate-nudge`), as its error rises in below. Slots are 40px wide and give up to 8px each when the
 * row runs out of room, so six of them still fit a 320px phone with the page's padding.
 */
export const codeFieldStyles = tv({
  slots: {
    slots: 'flex min-w-0 items-center gap-2 data-invalid:animate-nudge motion-reduce:animate-none',
    slot: [
      'h-12 w-10 min-w-8 rounded-m border border-line-strong bg-surface text-center font-mono text-heading-s text-ink caret-accent',
      'transition-[border-color,background-color,color] duration-(--duration-fast) ease-standard',
      'not-data-disabled:not-data-invalid:hover:border-ink-subtle',
      'focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-focus',
      'data-filled:animate-settle not-data-invalid:data-filled:border-ink motion-reduce:animate-none',
      'data-invalid:border-danger data-invalid:focus-visible:outline-danger',
      'data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:bg-surface-muted data-disabled:text-ink-muted',
    ],
    separator: 'h-px w-3 shrink-0 bg-line-strong',
  },
})
