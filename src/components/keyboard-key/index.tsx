import { type ReactNode } from 'react'

import { keyboardKey } from './keyboard-key.styles'

export type KeyboardKeyProps = {
  /** The key as it's printed on the keyboard: `⌘`, `K`, `Enter`. */
  children: ReactNode
  /** The key's name for screen readers, when its symbol doesn't say it: `Command` for `⌘`. */
  label?: string
  className?: string
}

/**
 * One key, written the way it looks on a keyboard. A shortcut is several of them side by side: `⌘` and `K`.
 *
 * @example
 * <KeyboardKey label="Command">⌘</KeyboardKey><KeyboardKey>K</KeyboardKey>
 */
export function KeyboardKey({ children, label, className }: KeyboardKeyProps) {
  return (
    <kbd className={keyboardKey({ className })}>
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </kbd>
  )
}
