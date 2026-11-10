/** What a person can answer: the agent goes ahead, or it doesn't. */
export const APPROVAL_REQUEST_DECISIONS = ['approved', 'rejected'] as const

/** Every visible or announced string, in English, so apps can translate them. */
export const APPROVAL_REQUEST_LABELS = {
  approve: 'Approve',
  reject: 'Reject',
  undo: 'Undo',
  pending: 'Needs approval',
  approved: 'Approved',
  rejected: 'Rejected',
  showAll: 'Show all',
  showLess: 'Show less',
} as const

/** The request's time, as the hour and minute in the reader's locale, like a message's. */
export const APPROVAL_REQUEST_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
} as const satisfies Intl.DateTimeFormatOptions

/**
 * How tall a preview is while folded, in rem: about four lines of text, the last one under the fade. Matches the
 * preview's `max-h-24`.
 */
export const APPROVAL_REQUEST_PREVIEW_CLAMP = 6
