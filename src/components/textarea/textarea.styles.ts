import { tv } from '@/lib/utils'

import { fieldBox } from '../field/field.styles'
import { type TEXTAREA_VARIANTS } from './textarea.const'

/**
 * A textarea that grows with its text (`field-sizing: content`) between a minimum and a maximum number of lines, then
 * scrolls. The bounds come in as `--min-rows` and `--max-rows` and are measured in lines (`lh`), so they follow the
 * type scale; the outline adds its padding and border to them. Browsers without `field-sizing` keep it at its minimum
 * and scroll. Its height doesn't animate: that would move the layout on every keystroke. The count turns red at the
 * limit, and nudges when a keystroke is refused there.
 */
export const textareaStyles = tv({
  slots: {
    textarea: 'field-sizing-content resize-none',
    // A box of its own, so it can move: transforms don't apply to inline text.
    count: 'inline-block tabular-nums',
  },
  variants: {
    variant: {
      outline: {
        textarea: [
          fieldBox(),
          'py-2',
          'max-h-[calc(var(--max-rows)*1lh_+_1rem_+_2px)] min-h-[calc(var(--min-rows)*1lh_+_1rem_+_2px)]',
        ],
      },
      // No box and no ring of its own: the surface around it (a prompt's card) shows the focus.
      ghost: {
        textarea: [
          'w-full min-w-0 bg-transparent px-1 text-body text-ink outline-none placeholder:text-ink-subtle',
          'max-h-[calc(var(--max-rows)*1lh)] min-h-[calc(var(--min-rows)*1lh)]',
        ],
      },
    } satisfies Record<(typeof TEXTAREA_VARIANTS)[number], object>,
    atLimit: { true: { count: 'text-danger' } },
    // One small shake when a keystroke is refused at the limit.
    nudge: { true: { count: 'animate-nudge motion-reduce:animate-none' } },
  },
  defaultVariants: { variant: 'outline', atLimit: false, nudge: false },
})
