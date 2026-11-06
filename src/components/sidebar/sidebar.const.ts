/** What screen readers hear, in English by default: the navigation's name and the collapse button's two labels. */
export const SIDEBAR_LABELS = {
  nav: 'Workspace',
  collapse: 'Collapse sidebar',
  expand: 'Expand sidebar',
} as const

/** A count's tones: `neutral` for totals, `accent` for what's waiting for someone, like approvals. */
export const SIDEBAR_COUNT_TONES = ['neutral', 'accent'] as const
