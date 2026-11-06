'use client'

import { useSyncExternalStore } from 'react'

function noSubscription() {
  return () => {}
}

function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
}

/** Whether shortcuts read ⌘ (Apple devices, and the server's guess) or Ctrl. Client-only. */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(noSubscription, isApplePlatform, () => true)
}
