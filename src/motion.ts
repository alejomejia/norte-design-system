// The package's `/motion` entry: Norte's timings in Motion's units, its lazy features, and the parts of Motion apps
// animate with. Apps take Motion from here, not from `motion` itself, so they share the one copy the components use.
// Each export is documented on Helpers → Motion, and `src/handbook/helpers/helpers.test.ts` fails if one isn't.

export { AnimatePresence, LazyMotion, MotionConfig, type Transition, type Variants } from 'motion/react'
export * as m from 'motion/react-m'
export { loadMotionFeatures, MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from './lib/motion'
