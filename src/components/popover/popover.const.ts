/** Where a popover opens, relative to its trigger. It flips when there's no room. */
export const POPOVER_SIDES = ['top', 'bottom', 'left', 'right'] as const

/** How a popover lines up with its trigger along that side. It shifts to stay on screen. */
export const POPOVER_ALIGNS = ['start', 'center', 'end'] as const

/** A popover's widths: `s` (240px), `m` (320px) or `l` (400px). */
export const POPOVER_WIDTHS = ['s', 'm', 'l'] as const

/** The gap between a popover and its trigger, in px: Tooltip's, a step more than a menu's. */
export const POPOVER_SIDE_OFFSET = 8

/** What screen readers hear for the close button. */
export const POPOVER_CLOSE_LABEL = 'Close'
