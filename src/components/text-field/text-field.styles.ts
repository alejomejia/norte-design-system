import { tv } from '@/lib/utils'

import { fieldBox } from '../field/field.styles'
import { type TEXT_FIELD_SIZES } from './text-field.const'

/**
 * A text field's control, inside the shared field frame (label, description, error). The input is the box, the one
 * Textarea shares; a leading icon and the clear button sit over it, and the input pads itself to make room. The icon
 * lets clicks through, so it focuses the input like the rest of the box. The clear button stays in place while the
 * field is empty, hidden (`invisible` takes it out of the tab order and the accessibility tree), so it can fade in and
 * out instead of popping.
 */
export const textFieldStyles = tv({
  slots: {
    control: 'group/control relative flex items-center',
    input: fieldBox(),
    // Wakes up while the field has focus: it's the field's, not a decoration.
    icon: 'pointer-events-none absolute left-3 text-ink-subtle transition-colors duration-(--duration-fast) group-focus-within/control:text-ink',
    clear: ['absolute right-1 flex', 'transition-[opacity,scale,visibility] duration-(--duration-fast) ease-standard'],
    // Its focus ring hugs it, so it stays inside the field's box.
    clearButton: 'rounded-s focus-visible:outline-offset-0',
  },
  variants: {
    size: {
      s: { input: 'h-8', clearButton: 'size-6' },
      m: { input: 'h-10' },
    } satisfies Record<(typeof TEXT_FIELD_SIZES)[number], object>,
    withIcon: { true: { input: 'pl-10' } },
    // A search input draws its own clear button in Chrome and Safari: Norte's replaces it.
    clearable: { true: { input: '[&::-webkit-search-cancel-button]:appearance-none' } },
    filled: { false: { clear: 'invisible scale-90 opacity-0' } },
  },
  compoundVariants: [
    { clearable: true, size: 's', class: { input: 'pr-8' } },
    { clearable: true, size: 'm', class: { input: 'pr-10' } },
  ],
  defaultVariants: { size: 'm', withIcon: false, clearable: false, filled: false },
})
