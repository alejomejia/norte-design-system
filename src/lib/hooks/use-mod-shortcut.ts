'use client'

import { useEffect, useEffectEvent } from 'react'

/**
 * Calls `onPress` when `key` is pressed with ⌘ (or Ctrl), anywhere on the page: `useModShortcut('k', toggle)` for ⌘K.
 * Other modifiers held with it don't count, so ⌘⇧K stays free. `false` listens for nothing. Client-only.
 */
export function useModShortcut(key: string | false, onPress: (event: KeyboardEvent) => void) {
  const press = useEffectEvent(onPress)

  useEffect(() => {
    if (!key) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      event.preventDefault()
      press(event)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key])
}
