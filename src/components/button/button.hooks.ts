'use client'

import { useEffect, useState } from 'react'

/**
 * Whether a button shows its check: from the moment `success` turns true, for `duration` ms, then the label again. It
 * shows once per success, even if `success` stays true, and clears as soon as `success` turns false (the next action
 * started), so the app never has to reset it.
 */
export function useSuccessFeedback(success: boolean, duration: number) {
  const [shown, setShown] = useState(false)
  const [previous, setPrevious] = useState(success)

  // Adjusted while rendering, not in an effect, so the check appears in the same frame the prop changes.
  if (success !== previous) {
    setPrevious(success)
    setShown(success)
  }

  useEffect(() => {
    if (!shown) return
    const timer = window.setTimeout(() => setShown(false), duration)
    return () => window.clearTimeout(timer)
  }, [shown, duration])

  return shown
}
