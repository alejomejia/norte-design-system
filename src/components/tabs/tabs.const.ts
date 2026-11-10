/** Tabs' looks: `line`, a bar under the active tab, for a panel's sections; `segmented`, a tile on a track, for a small switch. */
export const TABS_VARIANTS = ['line', 'segmented'] as const

/** Tabs' sizes: `s` (32px) and `m` (40px), the same heights as Select and Text field. */
export const TABS_SIZES = ['s', 'm'] as const

/** What the chevrons on a row that doesn't fit are called. Pointer-only: the arrow keys already move along the row. */
export const TABS_SCROLL_LABELS = { start: 'Scroll tabs back', end: 'Scroll tabs forward' } as const
