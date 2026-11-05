/** How long the pointer rests on a trigger before its tooltip opens, in ms. */
export const TOOLTIP_DELAY = 500

/**
 * How long tooltips stay warm after one closes, in ms: moving to a neighbor within it opens its tooltip at once, with
 * no delay and no animation, so running along a toolbar reads every label.
 */
export const TOOLTIP_WARM_WINDOW = 400

/** Where the tooltip opens, relative to its trigger. */
export const TOOLTIP_SIDES = ['top', 'right', 'bottom', 'left'] as const
