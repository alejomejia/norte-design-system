'use client'

import { AnimatePresence, LazyMotion, MotionConfig } from 'motion/react'
import * as m from 'motion/react-m'

import { loadMotionFeatures, MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from '@/lib/motion'

import { BUTTON_CHECK_PATH } from './button.const'
import { ButtonSpinner } from './button-spinner'

/** Where the spinner and the check sit: stacked over the hidden label, at its center. */
const LAYER = 'absolute inset-0 grid place-items-center'

/** How the spinner and the check leave: a quick shrink and fade, so the next one takes over. */
const EXIT = { opacity: 0, scale: 0.6, transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.exit } }

/**
 * What a busy button shows over its label: the spinner while its action runs, then a check that pops in and draws
 * itself when it succeeds. The spinner turns into the check rather than cutting to it: one shrinks away as the other
 * springs in. Motion loads the first time a button needs it; until then the states swap without animating.
 * `animateIn` animates the first state too, for a button that wasn't busy when it rendered.
 */
export function ButtonFeedback({ state, animateIn }: { state?: 'loading' | 'success'; animateIn: boolean }) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {/* Transforms stop under reduced motion; the fades stay, so the swap still reads. */}
      <MotionConfig reducedMotion="user">
        {/* Off for a button that rendered busy: its spinner is there from the start. */}
        <AnimatePresence initial={animateIn}>
          {state === 'loading' && (
            <m.span
              key="loading"
              className={LAYER}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={EXIT}
              transition={MOTION_SPRING}
            >
              <ButtonSpinner />
            </m.span>
          )}
          {state === 'success' && (
            <m.span
              key="success"
              className={LAYER}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={EXIT}
              transition={MOTION_SPRING}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-4"
              >
                <m.path
                  d={BUTTON_CHECK_PATH}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE.enter, delay: 0.05 }}
                />
              </svg>
            </m.span>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  )
}
