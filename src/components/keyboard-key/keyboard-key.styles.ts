import { tv } from '@/lib/utils'

/** A key cap, outlined: one box for a key or a whole shortcut, its keys tight together like `⌘K`. */
export const keyboardKey = tv({
  base: 'inline-flex h-6 min-w-6 shrink-0 items-center justify-center gap-0.5 rounded-s border border-line bg-surface-muted px-2 align-middle font-sans text-caption font-medium text-ink-muted',
})
