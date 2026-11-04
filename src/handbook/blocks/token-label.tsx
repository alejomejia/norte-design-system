import { type ReactNode } from 'react'

/** A token or class name, in mono: the way it's written in code. */
export function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-caption text-ink">{children}</code>
}

/** A token's note from `theme.css`, without the value it repeats: `14px: the interface's default` → `The interface's default`. */
export function describe(note: string): string {
  const text = note.replace(/^[\d.]+px:?\s*/, '')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** A secondary value under a token: its hex, its size, the primitive it points at. */
export function Meta({ children }: { children: ReactNode }) {
  return <span className="font-mono text-caption text-ink-subtle">{children}</span>
}
