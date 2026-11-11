'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Whether the page matches a media query, like `(min-width: 80rem)`, updated as it changes. False on the server and in
 * the first render of a hydrated page. Client-only.
 * @example
 * const wide = useMediaQuery('(min-width: 80rem)')
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
