'use client'

import { createContext, useContext } from 'react'

type SuggestionsState = {
  onSelect: (value: string) => void
  disabled: boolean
}

/** The root's `onSelect` and `disabled`, so each item doesn't repeat them. */
export const SuggestionsContext = createContext<SuggestionsState>({ onSelect: () => {}, disabled: false })

/** The `onSelect` and `disabled` of the `Suggestions` around an item. */
export function useSuggestions() {
  return useContext(SuggestionsContext)
}
