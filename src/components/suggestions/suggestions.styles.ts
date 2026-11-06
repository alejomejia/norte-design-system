import { tv } from '@/lib/utils'

/*
 * Suggestions: a row of outlined pills, quieter than buttons, since each is a prompt to send, not an action. A chip is a
 * small ghost Button with Button's quiet `fade` hover and its press; hovering also brings its words from muted to ink
 * and its outline a shade darker. Its focus ring sits inside the pill, so the row's scroller never clips it.
 *
 * Suggestions usually arrive once the agent is done, so the chips `rise` in one after another, 50ms apart; with reduced
 * motion they're all there at once. A row that doesn't fit scrolls sideways with the shared `scroll-fade-x` utility,
 * fading out on each side that hides chips, with a chevron there, like Tabs.
 */
export const suggestionsStyles = tv({
  slots: {
    // Its `data-overflow-*` attributes tell the list which sides fade, and show the chevrons there.
    root: 'group/row relative',
    list: 'flex scroll-fade-x gap-2',
    // No utility sets an animation's delay: the bracket reads each chip's turn.
    item: 'flex shrink-0 animate-rise [animation-delay:var(--suggestion-delay)] motion-reduce:animate-none',
    chip: [
      'rounded-full border border-line px-3 text-ink-muted focus-visible:-outline-offset-2',
      'not-data-disabled:hover:border-line-strong not-data-disabled:hover:text-ink',
    ],
    /*
     * On the fade, shown while its side hides chips. Hidden, it's `invisible` too, not just transparent, so it covers no
     * chip; `visibility` flips once the fade-out ends. Mirrored in right-to-left rows.
     */
    scrollStart: [
      'invisible absolute inset-y-0 start-0 flex items-center opacity-0 rtl:*:rotate-180',
      'transition-[opacity,visibility] duration-(--duration-fast) group-data-overflow-start/row:visible group-data-overflow-start/row:opacity-100',
    ],
    scrollEnd: [
      'invisible absolute inset-y-0 end-0 flex items-center opacity-0 rtl:*:rotate-180',
      'transition-[opacity,visibility] duration-(--duration-fast) group-data-overflow-end/row:visible group-data-overflow-end/row:opacity-100',
    ],
  },
})
