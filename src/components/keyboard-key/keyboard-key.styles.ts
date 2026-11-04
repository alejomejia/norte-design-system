import { tv } from '@/lib/utils'

/** A key cap: a raised box, its thicker bottom edge the key's side. */
export const keyboardKey = tv({
  base: 'inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-s border border-b-2 border-line bg-surface px-1 font-sans text-caption font-medium text-ink-muted',
})
