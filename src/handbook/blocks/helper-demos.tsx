import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { useCopy, useElapsed, useInViewport, useMediaQuery, useReducedMotion } from '@/hooks'
import {
  AnimatePresence,
  LazyMotion,
  loadMotionFeatures,
  MOTION_DURATION,
  MOTION_EASE,
  MotionConfig,
  m,
  type Variants,
} from '@/motion'
import { formatElapsed } from '@/utils'

import { Code } from './token-label'

/** The query the media query demo watches. */
const WIDE_QUERY = '(min-width: 64rem)'

/** What the copy demo copies. */
const IMPORT_LINE = "import { cn } from '@alejomejia/norte-design-system/utils'"

/** How often the viewport demo counts while it's on screen, in ms. */
const COUNT_INTERVAL = 1000

/** How far a step slides as it changes, in px, as on Sign in. */
const SLIDE = 8

/** The steps of the motion demo. */
const STEPS = ['Describe the run', 'Pick the agent', 'Review and start']

/** A step leaves quickly toward where the person came from, and the next one arrives at the pace of new content. */
const STEP_MOTION: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: SLIDE * direction }),
  center: { opacity: 1, x: 0, transition: { duration: MOTION_DURATION.appear, ease: MOTION_EASE.enter } },
  exit: (direction: number) => ({
    opacity: 0,
    x: -SLIDE * direction,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.exit },
  }),
}

/** The frame every demo sits in: one row, with a note under it on how to try it. */
function DemoFrame({ ref, hint, children }: { ref?: Ref<HTMLDivElement>; hint: string; children: ReactNode }) {
  return (
    <div ref={ref} className="sb-unstyled my-6 flex flex-col gap-3 rounded-l border border-line p-6">
      <div className="flex min-h-10 flex-wrap items-center gap-4">{children}</div>
      <p className="text-caption text-ink-subtle">{hint}</p>
    </div>
  )
}

/** `useMediaQuery` on a wide-screen query, live. */
export function MediaQueryDemo() {
  const wide = useMediaQuery(WIDE_QUERY)
  return (
    <DemoFrame hint="Resize the window across 1024px: the badge follows.">
      <Code>{`useMediaQuery('${WIDE_QUERY}')`}</Code>
      <Badge tone={wide ? 'accent' : 'neutral'} dot>
        {wide ? 'true' : 'false'}
      </Badge>
    </DemoFrame>
  )
}

/** `useReducedMotion`, reading this computer's setting. */
export function ReducedMotionDemo() {
  const reduced = useReducedMotion()
  return (
    <DemoFrame hint="Turn on Reduce motion in your system's accessibility settings: the badge follows, without a reload.">
      <Code>useReducedMotion()</Code>
      <Badge tone={reduced ? 'accent' : 'neutral'} dot>
        {reduced ? 'true' : 'false'}
      </Badge>
    </DemoFrame>
  )
}

/** A counter that only counts while `useInViewport` says it's worth it. */
export function InViewportDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInViewport(ref)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!visible) return
    const timer = window.setInterval(() => setSeconds((count) => count + 1), COUNT_INTERVAL)
    return () => window.clearInterval(timer)
  }, [visible])

  return (
    <DemoFrame ref={ref} hint="Scroll this out of view, or switch tabs, and come back: it paused while you were away.">
      <Code>useInViewport(ref)</Code>
      <Badge tone={visible ? 'success' : 'neutral'} dot>
        {visible ? 'Counting' : 'Paused'}
      </Badge>
      <span className="text-body-s text-ink-muted tabular-nums">{seconds}s on screen</span>
    </DemoFrame>
  )
}

/** A stopwatch on `useElapsed`, printed with `formatElapsed`. */
export function ElapsedDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState<{ startedAt: number; endedAt?: number }>()
  const running = run !== undefined && run.endedAt === undefined
  const elapsed = useElapsed(ref, run?.startedAt ?? 0, { running, endedAt: run?.endedAt })

  function toggle() {
    setRun(running ? { ...run, endedAt: Date.now() } : { startedAt: Date.now() })
  }

  return (
    <DemoFrame ref={ref} hint="Start it, then stop it: it ticks every 100ms, only while it's on screen.">
      <Button size="s" variant="secondary" onClick={toggle}>
        {running ? 'Stop' : 'Start'}
      </Button>
      <span className="text-body-s tabular-nums">{run ? formatElapsed(elapsed, { precise: true }) : '0.0s'}</span>
    </DemoFrame>
  )
}

/** `useCopy` on an import line: the label says it worked, then comes back. */
export function CopyDemo() {
  const [copied, copy] = useCopy()
  return (
    <DemoFrame hint="Copy it: the label confirms for two seconds, then comes back.">
      <Code>{IMPORT_LINE}</Code>
      <Button size="s" variant="secondary" onClick={() => copy(IMPORT_LINE)}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </DemoFrame>
  )
}

/** Steps that slide like Sign in's, from the motion entry alone. */
export function StepsDemo() {
  const [[step, direction], setStep] = useState([0, 1])

  function go(by: number) {
    setStep([(step + by + STEPS.length) % STEPS.length, by])
  }

  return (
    <DemoFrame hint="Go back and forth: a step leaves fast, toward where you came from, and the next one arrives slower.">
      <Button size="s" variant="secondary" onClick={() => go(-1)}>
        Back
      </Button>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <div className="min-w-48 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <m.p
                key={step}
                custom={direction}
                variants={STEP_MOTION}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-body-s font-medium"
              >
                {step + 1}. {STEPS[step]}
              </m.p>
            </AnimatePresence>
          </div>
        </MotionConfig>
      </LazyMotion>
      <Button size="s" onClick={() => go(1)}>
        Next
      </Button>
    </DemoFrame>
  )
}
