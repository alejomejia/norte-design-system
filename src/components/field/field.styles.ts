import { tv } from '@/lib/utils'

/**
 * The frame every text control sits in: a label, the control, a row with its description (and, at the end, something
 * like a character count), then its error, one under the other. An invalid field's error rises into place under the
 * description, and fades out with its words once fixed. A disabled field dims its label.
 */
export const fieldStyles = tv({
  slots: {
    root: 'group/field flex flex-col gap-2',
    label: 'text-body-s font-medium text-ink group-data-disabled/field:text-ink-muted',
    footer: 'flex items-start justify-between gap-4',
    description: 'text-caption text-ink-muted',
    aside: 'ms-auto shrink-0 text-caption text-ink-subtle',
    error: [
      'flex items-start gap-1 text-caption text-danger empty:hidden',
      'transition-[opacity,translate] duration-(--duration-appear) ease-enter',
      'data-starting-style:translate-y-1 data-starting-style:opacity-0',
      'data-ending-style:opacity-0 data-ending-style:duration-(--duration-fast) data-ending-style:ease-exit',
    ],
  },
})

/**
 * The box a person types in, shared by Text field and Textarea: a border that darkens on hover, a focus ring in its
 * place, red when invalid, and gray when disabled (a box that only fades out is easy to miss next to the ones around
 * it). The ring settles onto the box: it appears a little outside and tightens to the edge as the border fades. Only
 * its offset moves, which repaints without layout, and the outline exists only while focused: one that's always there,
 * transparent, would show on every field in forced colors. Base UI's Field sets the `data-*` states on the control.
 */
export const fieldBox = tv({
  base: [
    'w-full min-w-0 rounded-m border border-line-strong bg-surface px-3 text-body-s text-ink caret-accent placeholder:text-ink-subtle',
    'transition-[color,background-color,border-color,outline-offset] duration-(--duration-fast) ease-standard',
    'not-data-disabled:not-data-invalid:hover:border-ink-subtle',
    'outline-offset-2 focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus',
    'data-invalid:border-danger data-invalid:focus-visible:outline-danger',
    'data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:bg-surface-muted data-disabled:text-ink-muted',
  ],
})
