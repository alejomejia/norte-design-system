/**
 * How long the pointer rests on a trigger before its tooltip opens, in ms: almost at once, but not for a pointer just
 * passing through on its way somewhere else.
 */
export const TOOLTIP_DELAY = 100

/**
 * How long tooltips stay warm after one closes, in ms: moving to a neighbor within it opens its tooltip at once, with
 * no delay and no animation, so running along a toolbar reads every label.
 */
export const TOOLTIP_WARM_WINDOW = 400

/** Where the tooltip opens, relative to its trigger. */
export const TOOLTIP_SIDES = ['top', 'right', 'bottom', 'left'] as const

/** How the tooltip lines up with its trigger along that side: its start, its center or its end. */
export const TOOLTIP_ALIGNS = ['start', 'center', 'end'] as const
