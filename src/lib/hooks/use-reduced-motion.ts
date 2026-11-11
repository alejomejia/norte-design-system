'use client'

import { useMediaQuery } from './use-media-query'

/** Whether the person asked their system for less motion: continuous effects draw one still frame instead. Client-only. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
