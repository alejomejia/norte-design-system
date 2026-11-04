/** The duration tokens in seconds, for Motion transitions, which can't read CSS variables. */
export const MOTION_DURATION = { fast: 0.12, base: 0.2, slow: 0.32 } as const

/** The easing tokens as Motion's cubic Bézier arrays. */
export const MOTION_EASE = {
  standard: [0.2, 0, 0, 1],
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const

/** The `--ease-spring` token as a Motion transition: a short overshoot, then it settles. */
export const MOTION_SPRING = { type: 'spring', visualDuration: 0.3, bounce: 0.3 } as const
