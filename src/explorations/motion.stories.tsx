/*
 * Motion explorations, to choose from side by side. Temporary: once an option is picked, it moves into its component
 * (with tokens instead of the bracket values used here) and this file goes away. None of it ships.
 */
import { Button as BaseButton } from '@base-ui/react/button'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { spring } from 'motion'
import { AnimatePresence, motion } from 'motion/react'
import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/button'
import { BUTTON_CHECK_PATH, type BUTTON_VARIANTS } from '@/components/button/button.const'
import { button, buttonContent } from '@/components/button/button.styles'
import { ButtonFeedback } from '@/components/button/button-feedback'
import { ButtonSpinner } from '@/components/button/button-spinner'
import { switchStyles } from '@/components/switch/switch.styles'
import { cn, toCSSVars } from '@/lib/utils'

const meta = {
  title: 'Explorations/Motion',
  // Comparisons, not a component: no docs page.
  tags: ['!autodocs'],
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type Variant = (typeof BUTTON_VARIANTS)[number]

const VARIANTS: { variant: Variant; label: string }[] = [
  { variant: 'primary', label: 'Run agent' },
  { variant: 'secondary', label: 'Edit instructions' },
  { variant: 'ghost', label: 'View logs' },
  { variant: 'danger', label: 'Delete agent' },
]

/** A calm press for every option: a small sink on the standard curve, no overshoot. */
const PRESS = 'ease-standard duration-(--duration-fast) not-data-disabled:active:scale-98'

/** The hover fill of each variant, as a plain background change. */
const FILL: Record<Variant, string> = {
  primary: 'not-data-disabled:hover:bg-accent-hover',
  secondary: 'not-data-disabled:hover:bg-surface-muted',
  ghost: 'not-data-disabled:hover:bg-surface-muted',
  danger: 'not-data-disabled:hover:bg-danger-subtle',
}

/** A fade of the background, replacing the bloom. */
function fade(variant: Variant) {
  // After PRESS, so the fill keeps the base duration and the press its standard curve.
  return cn('transition-[background-color,scale] before:hidden', FILL[variant], PRESS, 'duration-(--duration-base)')
}

/** The light each variant's spotlight and sheen carry: white on blue, a tint of the text on light buttons. */
const GLOW: Record<Variant, string> = {
  primary: '[--glow:oklch(1_0_0/22%)]',
  secondary: '[--glow:oklch(0.546_0.245_262/9%)]',
  ghost: '[--glow:oklch(0.546_0.245_262/9%)]',
  danger: '[--glow:oklch(0.505_0.19_27/10%)]',
}

/** Writes the pointer's position on the button as CSS variables, for the spotlight. A ref write, no React state. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const { left, top } = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - top}px`)
}

type HoverOption = {
  name: string
  description: string
  className: (variant: Variant) => string
  tracksPointer?: boolean
}

const HOVER_OPTIONS: HoverOption[] = [
  {
    name: '1. Fade',
    description:
      'The quietest: the fill changes over 200ms instead of 120ms, on the standard curve, so the change is felt without being watched. Linear, Stripe.',
    className: fade,
  },
  {
    name: '2. Bloom',
    description:
      'The current one, without the spring: a fill grows from the center (320ms, ease-enter). Shows where the button is, but it moves the most.',
    className: () => PRESS,
  },
  {
    name: '3. Spotlight',
    description:
      'A soft light follows the pointer inside the button, on top of the fade. Feels alive and precise, the "AI product" look (Vercel, Raycast). Repaints on pointer move: cheap on a button, never on large surfaces.',
    className: (variant) =>
      cn(
        fade(variant),
        GLOW[variant],
        'before:block before:scale-100 before:bg-transparent before:bg-[radial-gradient(5rem_circle_at_var(--x)_var(--y),var(--glow),transparent)] before:transition-opacity',
      ),
    tracksPointer: true,
  },
  {
    name: '4. Lift',
    description:
      'The button rises 1px and a soft shadow appears under it, on top of the fade; a press puts it back down. Tactile, a little more "physical" than the others.',
    className: (variant) =>
      cn(
        fade(variant),
        'overflow-visible transition-[background-color,translate,scale] not-data-disabled:hover:-translate-y-px not-data-disabled:active:translate-y-0',
        'after:absolute after:inset-0 after:-z-10 after:rounded-m after:opacity-0 after:shadow-m after:transition-opacity after:duration-(--duration-base) not-data-disabled:hover:after:opacity-100',
      ),
  },
  {
    name: '5. Sheen',
    description:
      'A streak of light crosses the button once when the pointer enters, on top of the fade. The most expressive; good for the primary action, maybe too much for every button.',
    className: (variant) =>
      cn(
        fade(variant),
        GLOW[variant],
        'before:block before:scale-100 before:rounded-none before:bg-transparent before:bg-linear-to-r before:from-transparent before:via-(--glow) before:to-transparent before:opacity-100',
        'before:-translate-x-full before:transition-none not-data-disabled:hover:before:translate-x-full not-data-disabled:hover:before:transition-transform not-data-disabled:hover:before:duration-700 not-data-disabled:hover:before:ease-standard',
      ),
  },
]

/** An option's name and why you'd pick it, over its buttons. */
function Option({ name, description, children }: { name: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6 first:border-0 first:pt-0">
      <div className="flex max-w-2xl flex-col gap-1">
        <h2 className="text-body-s font-semibold text-ink">{name}</h2>
        <p className="text-body-s text-ink-muted">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  )
}

/** Five hover effects for `Button`, each on the four variants. Hover and press them. */
export const ButtonHover: Story = {
  name: 'Button hover',
  render: () => (
    <div className="flex flex-col gap-6">
      {HOVER_OPTIONS.map(({ name, description, className, tracksPointer }) => (
        <Option key={name} name={name} description={description}>
          {VARIANTS.map(({ variant, label }) => (
            <Button
              key={variant}
              variant={variant}
              className={className(variant)}
              onPointerMove={tracksPointer ? trackPointer : undefined}
            >
              {label}
            </Button>
          ))}
        </Option>
      ))}
    </div>
  ),
}

/** How long the example action runs, and how long the check shows, in ms. */
const RUN_DURATION = 1800
const CHECK_DURATION = 1200

type Status = 'idle' | 'loading' | 'success'

/** Where the feedback sits: over the hidden label, at its center. */
const LAYER = 'absolute inset-0 grid place-items-center'

/** A calm curve for the feedback: the standard easing, no overshoot. */
const CALM = { duration: 0.22, ease: [0.2, 0, 0, 1] } as const

/** 1. The current one: the spinner shrinks away and the check springs in with a little bounce. */
function PopFeedback({ status }: { status: Status }) {
  return <ButtonFeedback state={status === 'idle' ? undefined : status} animateIn />
}

/** 2. A crossfade: spinner and check trade places with a slight blur and scale, no bounce. */
function CrossfadeFeedback({ status }: { status: Status }) {
  const hidden = { opacity: 0, scale: 0.85, filter: 'blur(2px)' }
  const shown = { opacity: 1, scale: 1, filter: 'blur(0px)' }
  return (
    <AnimatePresence initial={false}>
      {status === 'loading' && (
        <motion.span key="loading" className={LAYER} initial={hidden} animate={shown} exit={hidden} transition={CALM}>
          <ButtonSpinner />
        </motion.span>
      )}
      {status === 'success' && (
        <motion.span key="success" className={LAYER} initial={hidden} animate={shown} exit={hidden} transition={CALM}>
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
            <motion.path
              d={BUTTON_CHECK_PATH}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ ...CALM, duration: 0.3, delay: 0.08 }}
            />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  )
}

/** 3. The ring closes: the spinner's arc keeps turning and grows into a full circle, then a check draws inside it. */
function RingFeedback({ status }: { status: Status }) {
  const success = status === 'success'
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.span
          key="ring"
          className={LAYER}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={CALM}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-4"
          >
            <circle cx="12" cy="12" r="10" className="opacity-25" />
            {/* The dash pattern repeats every full turn (length + spacing = 1), so the loop never jumps. */}
            <motion.path
              d="M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20"
              initial={{ pathLength: 0.25, pathSpacing: 0.75, pathOffset: 0 }}
              animate={
                success
                  ? { pathLength: 1, pathSpacing: 0, pathOffset: 1 }
                  : { pathLength: 0.25, pathSpacing: 0.75, pathOffset: [0, 1] }
              }
              transition={
                success
                  ? { type: 'spring', visualDuration: 0.45, bounce: 0 }
                  : { pathOffset: { duration: 0.8, ease: 'linear', repeat: Infinity }, default: CALM }
              }
            />
            <motion.path
              d="m7.5 12 3 3 6-6"
              // Hidden, not only empty, until it draws: a round cap shows a dot even at length 0.
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: success ? 1 : 0, opacity: success ? 1 : 0 }}
              transition={{ ...CALM, duration: 0.3, delay: success ? 0.3 : 0 }}
            />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  )
}

/*
 * 4. The swoop: one path holds two turns of the spinner's circle, then the check. The spinner is a short dash running
 * around the first turn; on success the dash keeps going, speeds up through the second turn and lands as the check, so
 * spinner and check are the same stroke. Fractions of the path's length, from its geometry (r = 9, check from (4, 12)).
 */
const SWOOP_PATH = 'M3 12a9 9 0 1 1 18 0a9 9 0 1 1-18 0a9 9 0 1 1 18 0a9 9 0 1 1-18 0L4 12l5 5L20 6'
const SWOOP_TURN = 0.4136
const SWOOP_CHECK_START = 0.8345
const SWOOP_CHECK = 0.1655

function SwoopFeedback({ status }: { status: Status }) {
  const success = status === 'success'
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.span
          key="swoop"
          className={LAYER}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={CALM}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-4 overflow-visible"
          >
            <motion.path
              d={SWOOP_PATH}
              initial={{ pathLength: 0.1, pathOffset: 0 }}
              animate={
                success
                  ? { pathLength: SWOOP_CHECK, pathOffset: SWOOP_CHECK_START }
                  : { pathLength: 0.1, pathOffset: [0, SWOOP_TURN] }
              }
              transition={
                success
                  ? // A spring keeps the dash's speed as it leaves the loop, so it accelerates instead of jumping.
                    { type: 'spring', visualDuration: 0.6, bounce: 0 }
                  : { pathOffset: { duration: 0.8, ease: 'linear', repeat: Infinity } }
              }
            />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  )
}

/** A button that runs a pretend action on click: loading, then success, then its label again. */
function DemoButton({
  variant,
  feedback: Feedback,
  children,
}: {
  variant: Variant
  feedback: (props: { status: Status }) => ReactNode
  children: ReactNode
}) {
  const [status, setStatus] = useState<Status>('idle')
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  function run() {
    setStatus('loading')
    timers.current = [
      window.setTimeout(() => setStatus('success'), RUN_DURATION),
      window.setTimeout(() => setStatus('idle'), RUN_DURATION + CHECK_DURATION),
    ]
  }

  const busy = status !== 'idle'
  return (
    <BaseButton
      onClick={run}
      disabled={busy}
      focusableWhenDisabled
      aria-busy={status === 'loading' || undefined}
      className={button({ variant, busy, loading: status === 'loading', className: PRESS })}
    >
      <Feedback status={status} />
      <span className={buttonContent({ busy })}>{children}</span>
    </BaseButton>
  )
}

const MORPHS = [
  {
    name: '1. Pop (current)',
    description:
      'The spinner shrinks away and the check springs in with a small bounce. Two separate things, and the bounce is the playful part.',
    feedback: PopFeedback,
  },
  {
    name: '2. Crossfade',
    description:
      'Spinner and check trade places with a slight blur and scale on the standard curve, the check drawing as it arrives. The calmest; still two things.',
    feedback: CrossfadeFeedback,
  },
  {
    name: '3. Ring closes',
    description:
      'The arc keeps turning and grows into a full circle, then a check draws inside it. Reads as "finished" before the check even shows.',
    feedback: RingFeedback,
  },
  {
    name: '4. Swoop',
    description:
      'Spinner and check are one stroke: the arc speeds up out of its loop and lands as the check. The smoothest handoff: nothing appears or disappears.',
    feedback: SwoopFeedback,
  },
]

/** Four ways the spinner can become a check. Click a button: it loads for 1.8s, shows the check, then its label. */
export const ButtonSuccess: Story = {
  name: 'Button loading to success',
  render: () => (
    <div className="flex flex-col gap-6">
      {MORPHS.map(({ name, description, feedback }) => (
        <Option key={name} name={name} description={description}>
          <DemoButton variant="primary" feedback={feedback}>
            Run agent
          </DemoButton>
          <DemoButton variant="secondary" feedback={feedback}>
            Save draft
          </DemoButton>
        </Option>
      ))}
    </div>
  ),
}

/** Motion's spring with no bounce, as a CSS duration and `linear()` curve, for the switch options. */
const [SPRING_DURATION = '', SPRING_EASE = ''] = String(spring(0.3, 0)).split(/ (.+)/)

const SWITCH_OPTIONS = [
  {
    name: '1. Spring with bounce (current)',
    description: "Motion's spring(0.3, 0.3): the thumb overshoots a little and settles, and stretches while pressed.",
    thumb: '',
  },
  {
    name: '2. Spring, no bounce',
    description:
      "Motion's spring(0.3, 0): the same physical deceleration with no overshoot. Still feels responsive, without the playfulness.",
    thumb: 'duration-(--spring-duration) ease-(--spring-ease)',
  },
  {
    name: '3. Ease out',
    description: 'The enter curve over 200ms: quick start, soft landing. Keeps the stretch while pressed.',
    thumb: 'duration-(--duration-base) ease-enter',
  },
  {
    name: '4. Ease out, no stretch',
    description:
      'The same curve, and the thumb keeps its shape when pressed. The most restrained, closest to a native control.',
    thumb: 'duration-(--duration-base) ease-enter group-not-data-disabled:group-active:scale-x-100',
  },
]

/** Four ways the switch's thumb can move. Click them, and hold one pressed to see the stretch. */
export const SwitchMotion: Story = {
  name: 'Switch motion',
  render: () => {
    const styles = switchStyles({ labelled: true })
    return (
      <div
        className="flex flex-col gap-6"
        style={toCSSVars({ 'spring-duration': SPRING_DURATION, 'spring-ease': SPRING_EASE })}
      >
        {SWITCH_OPTIONS.map(({ name, description, thumb }) => (
          <Option key={name} name={name} description={description}>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI renders the switch inside, a button with its hidden input */}
            <label className={styles.label()}>
              <BaseSwitch.Root className={styles.root()}>
                <BaseSwitch.Thumb className={cn(styles.thumb(), thumb)} />
              </BaseSwitch.Root>
              Approve tool calls automatically
            </label>
          </Option>
        ))}
      </div>
    )
  },
}
