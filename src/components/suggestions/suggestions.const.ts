/** What the list and its chevrons are called. The chevrons are pointer-only: Tab already moves along the row. */
export const SUGGESTIONS_LABELS = {
  list: 'Suggestions',
  scrollStart: 'Scroll suggestions back',
  scrollEnd: 'Scroll suggestions forward',
} as const

/** How long each chip waits after the one before it as the row appears, in ms, so they arrive one after another. */
export const SUGGESTIONS_STAGGER = 50
