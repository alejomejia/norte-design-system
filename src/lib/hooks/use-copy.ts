'use client'

import { useEffect, useRef, useState } from 'react'

/** How long a copy stays fresh, in ms: long enough to see a check and hear "Copied". */
const COPIED_DURATION = 2000

/**
 * Copies a text to the clipboard and remembers it for a moment, for a check and an announcement. A copy the browser
 * refuses (no permission, no focus) leaves it unchanged. Client-only.
 * @returns whether the last copy is still fresh, and the function that copies (it resolves to whether it did).
 * @example
 * const [copied, copy] = useCopy()
 * <button onClick={() => copy(summary)}>{copied ? 'Copied' : 'Copy'}</button>
 */
export function useCopy(duration = COPIED_DURATION) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return false
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), duration)
    return true
  }

  return [copied, copy] as const
}
