import { tv } from '@/lib/utils'

import { type TEXT_FIELD_SIZES } from './text-field.const'

/**
 * A text field: a label, the input, then its description and error, one under the other. The input is the box, with
 * the same border, hover and focus ring as Code field; a leading icon and the clear button sit over it, and the input
 * pads itself to make room. The icon lets clicks through, so it focuses the input like the rest of the box. The clear
 * button stays in place while the field is empty, hidden (`invisible` takes it out of the tab order and the
 * accessibility tree), so it can fade in and out instead of popping. An invalid field turns its border and focus ring
 * red, and its error rises into place under the description. A disabled field fills with gray, its border and text
 go quiet and its label dims: a whole field fading out is easy to miss next to the ones around it.
 */
export const textFieldStyles = tv({
  slots: {
    root: 'group/field flex flex-col gap-2',
    label: 'text-body-s font-medium text-ink group-data-disabled/field:text-ink-muted',
    control: 'relative flex items-center',
    input: [
      'w-full min-w-0 rounded-m border border-line-strong bg-surface px-3 text-body-s text-ink caret-accent placeholder:text-ink-subtle',
      'transition-colors duration-(--duration-fast) not-data-disabled:not-data-invalid:hover:border-ink-subtle',
      'focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-focus',
      'data-invalid:border-danger data-invalid:focus-visible:outline-danger',
      'data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:bg-surface-muted data-disabled:text-ink-muted',
    ],
    icon: 'pointer-events-none absolute left-3 text-ink-subtle',
    clear: ['absolute right-1 flex', 'transition-[opacity,scale,visibility] duration-(--duration-fast) ease-standard'],
    // Its focus ring hugs it, so it stays inside the field's box.
    clearButton: 'rounded-s focus-visible:outline-offset-0',
    description: 'text-caption text-ink-muted',
    error: [
      'flex items-start gap-1 text-caption text-danger empty:hidden',
      'transition-[opacity,translate] duration-(--duration-base) ease-enter',
      'data-starting-style:translate-y-1 data-starting-style:opacity-0',
      'data-ending-style:opacity-0 data-ending-style:ease-exit',
    ],
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
