import { Fragment, type ReactNode } from 'react'

import { KEY_LABELS } from './keyboard-key.const'
import { keyboardKey } from './keyboard-key.styles'

export type KeyboardKeyProps = {
  /** A shortcut's keys, in order, as they're printed: `['⌘', 'K']`. They share one cap, like `⌘K`. */
  keys?: string[]
  /** One key, as it's printed, for a key that isn't a shortcut. Use `keys` for combinations. */
  children?: ReactNode
  /** The key's name for screen readers, when `children` is a symbol: `Command` for `⌘`. */
  label?: string
  /** The names screen readers say for symbols in `keys`. English by default (`⌘` is "Command"): pass yours to translate. */
  keyLabels?: Record<string, string>
  className?: string
}

/** A key as it's printed, with its spoken name when the symbol doesn't say it. */
function Key({ value, label }: { value: ReactNode; label?: string }) {
  if (!label) return value
  return (
    <>
      <span aria-hidden="true">{value}</span>
      <span className="sr-only">{label}</span>
    </>
  )
}

/**
 * A key or a shortcut, written the way it looks on a keyboard: one cap for the whole shortcut, its keys side by side.
 * Each key is a `<kbd>` inside the cap's `<kbd>`, the HTML for a key combination.
 *
 * @example
 * <KeyboardKey keys={['⌘', 'K']} />
 */
export function KeyboardKey({ keys, children, label, keyLabels = KEY_LABELS, className }: KeyboardKeyProps) {
  return (
    <kbd className={keyboardKey({ className })}>
      {keys ? (
        keys.map((key, index) => (
          // Keys can repeat (`⇧ ⇧`), so the position is part of the key.
          <Fragment key={`${index}-${key}`}>
            {/* A space for screen readers, so `⌘` `K` reads "Command K", not "CommandK". */}
            {index > 0 && <span className="sr-only"> </span>}
            {/* Tailwind's base styles set every `kbd` in the mono font: the keys keep the cap's. */}
            <kbd className="font-sans">
              <Key value={key} label={keyLabels[key]} />
            </kbd>
          </Fragment>
        ))
      ) : (
        <Key value={children} label={label} />
      )}
    </kbd>
  )
}
