import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

/** The icon's colors: `success` for something done, `neutral` for something declined or removed. */
export const UNDO_ACTION_TONES = ['success', 'neutral'] as const

/**
 * What a row does once committed: `settle` into plain text where it was, or `leave`, fading and closing its height,
 * when something else already shows the outcome.
 */
export const UNDO_ACTION_AFTER_COMMIT = ['settle', 'leave'] as const

/** How long the undo stays available by default, in ms. */
export const UNDO_ACTION_DURATION = 5000

/**
 * How the row leaves when it's undone: it shrinks a little, blurs and fades, in the exit curve, over `--duration-base`.
 * The way it came in, backwards.
 */
export const UNDO_ACTION_LEAVE = {
  keyframes: { opacity: [1, 0], scale: [1, 0.96], filter: ['blur(0)', 'blur(2px)'] },
  timing: {
    duration: MOTION_DURATION.base * 1000,
    easing: `cubic-bezier(${MOTION_EASE.exit.join(', ')})`,
    fill: 'forwards',
  },
} as const satisfies { keyframes: PropertyIndexedKeyframes; timing: KeyframeAnimationOptions }

/**
 * How a committed row leaves, with `afterCommit="leave"`: it fades over `--duration-fast`, then its height closes over
 * `--duration-slow`, like a dismissed alert. The fade stays under reduced motion; the height closes at once.
 */
export const UNDO_ACTION_GO = {
  fade: {
    keyframes: { opacity: [1, 0] },
    timing: {
      duration: MOTION_DURATION.fast * 1000,
      easing: `cubic-bezier(${MOTION_EASE.standard.join(', ')})`,
      fill: 'forwards',
    },
  },
  close: {
    timing: {
      duration: MOTION_DURATION.slow * 1000,
      delay: MOTION_DURATION.fast * 1000,
      easing: `cubic-bezier(${MOTION_EASE.standard.join(', ')})`,
      fill: 'forwards',
    },
  },
} as const satisfies Record<string, { keyframes?: PropertyIndexedKeyframes; timing: KeyframeAnimationOptions }>
