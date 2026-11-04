/*
 * Motion explorations, to choose from side by side. Temporary: once an option is picked, it moves into its component
 * (with tokens instead of the primitives and bracket values used here) and this file goes away. None of it ships.
 */
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { type PointerEvent, type ReactNode } from 'react'

import { Button } from '@/components/button'
import { type BUTTON_VARIANTS } from '@/components/button/button.const'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'

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

/*
 * What every option shares. The button itself keeps its spring press and only transitions its text color; the hover
 * lives on two layers, `before:` (the fill) and `after:` (a border or a shadow), each timed on its own: 400ms in,
 * 250ms out, so the change is seen arriving and gets out of the way when the pointer leaves.
 */
const BASE = cn(
  'transition-[scale,translate,color] duration-(--duration-spring) ease-spring',
  'before:duration-250 before:ease-enter not-data-disabled:hover:before:duration-400',
  'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-m after:opacity-0',
  'after:transition-opacity after:duration-250 not-data-disabled:hover:after:opacity-100 not-data-disabled:hover:after:duration-400',
)

/** A stronger hover fill per variant than today's, so the change reads at a glance. */
const FILL: Record<Variant, string> = {
  primary: 'before:bg-blue-800',
  secondary: 'before:bg-surface-muted',
  ghost: 'before:bg-neutral-200',
  danger: 'before:bg-danger not-data-disabled:hover:text-on-accent',
}

/**
 * The fill for options where it travels across the button (the wipe, the bloom). Danger can't go solid red there: its
 * label would have to turn white exactly where the red has reached, and over the rest it would vanish. A deeper tint of
 * red keeps the red label readable at every point of the sweep (5:1).
 */
function travelingFill(variant: Variant) {
  return variant === 'danger' ? 'before:bg-[oklch(0.936_0.032_17)]' : FILL[variant]
}

/** The `after:` layer as a border: the secondary button's outline darkens to the text color. */
const OUTLINE: Record<Variant, string> = {
  primary: 'after:hidden',
  secondary: 'after:border after:border-ink',
  ghost: 'after:hidden',
  danger: 'after:hidden',
}

/** The light the spotlight carries: white on blue, a tint of the text on light buttons. */
const GLOW: Record<Variant, string> = {
  primary: '[--glow:oklch(1_0_0/30%)]',
  secondary: '[--glow:oklch(0.546_0.245_262/14%)]',
  ghost: '[--glow:oklch(0.546_0.245_262/14%)]',
  danger: '[--glow:oklch(0.505_0.19_27/16%)]',
}

/** The shadow each variant lifts with: a glow in its own color for the colored ones. */
const SHADOW: Record<Variant, string> = {
  primary: 'after:shadow-[0_0.5rem_1.5rem_-0.375rem_oklch(0.546_0.245_262/55%)]',
  secondary: 'after:shadow-m',
  ghost: 'after:shadow-m',
  danger: 'after:shadow-[0_0.5rem_1.5rem_-0.375rem_oklch(0.505_0.19_27/45%)]',
}

/** Writes the pointer's position on the button as CSS variables, through the element: no React state. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const { left, top } = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - top}px`)
}

type HoverOption = {
  name: string
  description: string
  className: (variant: Variant) => string
  /** When the pointer's position is written: on every move, or only where it enters and leaves. */
  pointer?: 'move' | 'edges'
}

const HOVER_OPTIONS: HoverOption[] = [
  {
    name: '1. Fade, stronger',
    description:
      "Today's quiet fade, but slower and with colors that read: a deeper blue, a dark outline on secondary, a gray you can see on ghost, and danger turns solid red. The safest step up.",
    className: (variant) => cn(BASE, FILL[variant], OUTLINE[variant], 'before:scale-100 before:transition-opacity'),
  },
  {
    name: '2. Wipe',
    description:
      'The fill sweeps in from the left and, when the pointer leaves, carries on out to the right, so it passes through instead of rewinding. Directional and confident, a little editorial. Danger fills with a deeper pink, so its label reads during the sweep.',
    className: (variant) =>
      cn(
        BASE,
        travelingFill(variant),
        OUTLINE[variant],
        'before:origin-right before:scale-x-0 before:scale-y-100 before:opacity-100 before:transition-transform not-data-disabled:hover:before:origin-left not-data-disabled:hover:before:scale-x-100',
        'before:ease-standard not-data-disabled:hover:before:duration-500',
      ),
  },
  {
    name: '3. Bloom from the pointer',
    description:
      'The fill grows as a circle from where the pointer came in, and shrinks back toward where it left. It answers the pointer directly; the most "alive" of the five. Danger fills with a deeper pink, like the wipe.',
    className: (variant) =>
      cn(
        BASE,
        travelingFill(variant),
        OUTLINE[variant],
        'before:inset-auto before:top-(--y) before:left-(--x) before:size-80 before:-translate-1/2 before:rounded-full',
        'before:scale-0 before:opacity-100 before:transition-transform not-data-disabled:hover:before:scale-100 not-data-disabled:hover:before:duration-500',
      ),
    pointer: 'edges',
  },
  {
    name: '4. Spotlight',
    description:
      'A wide, soft light follows the pointer, larger and brighter than the first round, and the secondary outline darkens. Precise and quiet: the look of AI tools like Vercel or Raycast.',
    className: (variant) =>
      cn(
        BASE,
        GLOW[variant],
        OUTLINE[variant],
        'before:scale-100 before:bg-transparent before:bg-[radial-gradient(8rem_circle_at_var(--x)_var(--y),var(--glow),transparent)] before:transition-opacity',
      ),
    pointer: 'move',
  },
  {
    name: '5. Lift and glow',
    description:
      'The button rises 2px over a soft shadow in its own color (a blue glow under primary, a red one under danger), with the stronger fill. The most physical; strong for a primary action.',
    className: (variant) =>
      cn(
        BASE,
        FILL[variant],
        SHADOW[variant],
        'overflow-visible before:scale-100 before:transition-opacity',
        'not-data-disabled:hover:-translate-y-0.5 not-data-disabled:active:translate-y-0',
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

/**
 * Five hover effects for `Button`, each on the four variants, plus one with an icon. Hover in and out slowly, then
 * quickly, and press them.
 */
export const ButtonHover: Story = {
  name: 'Button hover',
  render: () => (
    <div className="flex flex-col gap-6">
      {HOVER_OPTIONS.map(({ name, description, className, pointer }) => (
        <Option key={name} name={name} description={description}>
          {VARIANTS.map(({ variant, label }) => (
            <Button
              key={variant}
              variant={variant}
              className={className(variant)}
              onPointerMove={pointer === 'move' ? trackPointer : undefined}
              onPointerEnter={pointer ? trackPointer : undefined}
              onPointerLeave={pointer === 'edges' ? trackPointer : undefined}
            >
              {label}
            </Button>
          ))}
          <Button
            variant="secondary"
            className={className('secondary')}
            onPointerMove={pointer === 'move' ? trackPointer : undefined}
            onPointerEnter={pointer ? trackPointer : undefined}
            onPointerLeave={pointer === 'edges' ? trackPointer : undefined}
          >
            Open run <Icon name="arrow-right" />
          </Button>
        </Option>
      ))}
    </div>
  ),
}
