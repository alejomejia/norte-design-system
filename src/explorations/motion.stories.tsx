/*
 * Motion explorations. Temporary: once the direction is settled, it moves into `Button` (with tokens instead of the
 * primitives and bracket values used here) and this file goes away. None of it ships.
 */
import { type Meta, type StoryObj } from '@storybook/react-vite'

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

/**
 * The wipe's fill per variant, stronger than today's hover so it reads at a glance. Danger fills with a deeper tint of
 * red rather than solid red: its label would have to turn white exactly where the red has reached, and over the rest it
 * would vanish. The tint keeps the red label readable at every point of the sweep (5:1).
 */
const FILL: Record<Variant, string> = {
  primary: 'before:bg-blue-800 after:hidden',
  secondary: 'before:bg-surface-muted after:border after:border-ink',
  ghost: 'before:bg-neutral-200 after:hidden',
  danger: 'before:bg-[oklch(0.936_0.032_17)] after:hidden',
}

/*
 * The button keeps its spring press; the hover lives on two layers. `before:` is the fill: it sweeps in from the left
 * (500ms) and, when the pointer leaves, carries on out to the right (250ms), so it passes through instead of rewinding:
 * its origin flips with the hover. `after:` darkens the secondary button's outline in step.
 */
const WIPE = cn(
  'transition-[scale,color] duration-(--duration-spring) ease-spring',
  'before:origin-right before:scale-x-0 before:scale-y-100 before:opacity-100 before:transition-transform before:duration-250 before:ease-standard',
  'not-data-disabled:hover:before:origin-left not-data-disabled:hover:before:scale-x-100 not-data-disabled:hover:before:duration-500',
  'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-m after:opacity-0 after:transition-opacity after:duration-250',
  'not-data-disabled:hover:after:opacity-100 not-data-disabled:hover:after:duration-400',
)

/** The wipe on the four variants, and on a button with an icon. Hover in and out slowly, then quickly, and press. */
export const ButtonHover: Story = {
  name: 'Button hover: wipe',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {VARIANTS.map(({ variant, label }) => (
        <Button key={variant} variant={variant} className={cn(WIPE, FILL[variant])}>
          {label}
        </Button>
      ))}
      <Button variant="secondary" className={cn(WIPE, FILL.secondary)}>
        Open run <Icon name="arrow-right" />
      </Button>
    </div>
  ),
}
