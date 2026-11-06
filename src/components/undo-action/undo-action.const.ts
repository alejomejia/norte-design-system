import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

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
