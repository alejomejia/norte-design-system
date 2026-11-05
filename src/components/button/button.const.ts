/** A button's looks, from the strongest to the quietest, then the one for what can't be undone. */
export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const

/** How a button's fill arrives on hover: `wipe` sweeps across and draws the eye, `fade` stays quiet in a row. */
export const BUTTON_HOVERS = ['wipe', 'fade'] as const

/** A button's heights: `s` (32px) for toolbars and dense rows, `m` (40px) everywhere else. */
export const BUTTON_SIZES = ['s', 'm'] as const

/** How long a button shows its check after a success before its label comes back, in ms. */
export const BUTTON_SUCCESS_DURATION = 1200

/** Lucide's check, drawn by the button's success feedback. */
export const BUTTON_CHECK_PATH = 'M20 6 9 17l-5-5'
