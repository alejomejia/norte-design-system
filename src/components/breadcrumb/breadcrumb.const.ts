/** How many items a path shows before its middle collapses into a menu. */
export const BREADCRUMB_MAX_ITEMS = 4

/** How many items stay visible before the collapsed part: the path's root. */
export const BREADCRUMB_ITEMS_BEFORE = 1

/** How many items stay visible after the collapsed part: the page and its parent. */
export const BREADCRUMB_ITEMS_AFTER = 2

/** The navigation's accessible name, what a screen reader's landmarks list calls it. */
export const BREADCRUMB_LABEL = 'Breadcrumb'

/** The accessible name and tooltip of the button that opens the collapsed pages. */
export const BREADCRUMB_MORE_LABEL = 'Show hidden pages'

/** What sits between two items. */
export const BREADCRUMB_SEPARATOR = '/'

/**
 * Which labels may truncate when the row runs out of room: `all`; only the `ancestors`, so the current page stays
 * whole; or only the `current` page, so the path above it stays whole.
 */
export const BREADCRUMB_TRUNCATE = ['all', 'ancestors', 'current'] as const
