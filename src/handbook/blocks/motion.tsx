import { token } from '@/handbook/tokens'
import { cn } from '@/lib/utils'

import { CopyToken } from './copy-token'
import { Meta } from './token-label'
import { TokenCell, TokenRow, TokenTable } from './token-table'

/** Each duration with the class that plays it on the demo dot, written out so Tailwind finds it. */
const DURATIONS = [
  { name: 'fast', className: 'duration-(--duration-fast)' },
  { name: 'base', className: 'duration-(--duration-base)' },
  { name: 'slow', className: 'duration-(--duration-slow)' },
  { name: 'slower', className: 'duration-(--duration-slower)' },
  { name: 'appear', className: 'duration-(--duration-appear)' },
  { name: 'spring', className: 'duration-(--duration-spring) ease-spring' },
]

const EASINGS = [
  { name: 'standard', className: 'ease-standard', use: 'Most changes: a state, a size, a color' },
  { name: 'enter', className: 'ease-enter', use: 'What appears: menus, toasts, dialogs' },
  { name: 'exit', className: 'ease-exit', use: 'What leaves, quicker than it came' },
  {
    name: 'spring',
    className: 'ease-spring duration-(--duration-spring)',
    use: 'Small things that settle: a press, a check',
  },
]

/** `cubic-bezier(0.2, 0, 0, 1)` → its four numbers. */
function bezierPoints(value: string): number[] {
  return (/cubic-bezier\(([^)]+)\)/.exec(value)?.[1] ?? '0, 0, 1, 1').split(',').map(Number)
}

/** `linear(0, 0.11, …, 1)` → its stops, evenly spaced in time. */
function linearStops(value: string): number[] {
  return (/linear\(([^)]+)\)/.exec(value)?.[1] ?? '0, 1').split(',').map(Number)
}

/** An easing's curve as an SVG path in a `size` square: a cubic Bézier, or the stops of a `linear()` spring. */
function curvePath(value: string, size: number) {
  if (value.startsWith('linear(')) {
    const stops = linearStops(value)
    return stops
      .map((stop, index) => `${index === 0 ? 'M' : 'L'}${(index / (stops.length - 1)) * size} ${(1 - stop) * size}`)
      .join(' ')
  }
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = bezierPoints(value)
  return `M0 ${size} C${x1 * size} ${(1 - y1) * size} ${x2 * size} ${(1 - y2) * size} ${size} 0`
}

/** The curve of an easing: time runs left to right, progress bottom to top. A spring overshoots the top. */
function Curve({ value }: { value: string }) {
  const size = 64
  return (
    <svg viewBox={`-4 -4 ${size + 8} ${size + 8}`} className="size-20 overflow-visible" aria-hidden="true">
      <path d={`M0 ${size} H${size} M0 ${size} V0`} className="stroke-line" fill="none" />
      <path d={curvePath(value, size)} className="stroke-accent" strokeWidth={2} fill="none" />
    </svg>
  )
}

/**
 * A dot that crosses its track when its row or card is hovered, at the given duration and easing. It rides a track one
 * dot shorter than the bar and slides by its own width: transform only, no layout.
 */
function Demo({ className }: { className: string }) {
  return (
    <span className="relative block h-2 w-full rounded-full bg-line">
      <span
        className={cn('absolute inset-y-0 right-2 left-0 transition-transform group-hover:translate-x-full', className)}
      >
        <span className="block size-2 rounded-full bg-accent" />
      </span>
    </span>
  )
}

/** The durations: their token, value, what they're for, and a dot to watch them. They drop to zero under reduced motion. */
export function Durations() {
  return (
    <TokenTable
      columns={[
        { name: 'Token', className: 'w-52' },
        { name: 'Value', className: 'w-24' },
        { name: 'Use' },
        { name: 'Hover to play', className: 'w-40' },
      ]}
    >
      {DURATIONS.map(({ name, className }) => {
        const { value, note } = token(`duration-${name}`)
        return (
          <TokenRow key={name}>
            <TokenCell>
              <CopyToken name={`duration-${name}`} />
            </TokenCell>
            <TokenCell>
              {/* A spring's `linear()` runs to a line of numbers: its note says where it comes from instead. */}
              <Meta>{value.startsWith('linear(') ? note : value}</Meta>
            </TokenCell>
            <TokenCell>
              <span className="text-caption text-ink-muted">{note}</span>
            </TokenCell>
            <TokenCell>
              <Demo className={cn('ease-standard', className)} />
            </TokenCell>
          </TokenRow>
        )
      })}
    </TokenTable>
  )
}

/** The easings as cards: the curve, a dot that plays it on hover, then its name, token, value and use. */
export function Easings() {
  return (
    <ul className="sb-unstyled my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {EASINGS.map(({ name, className, use }) => {
        const { value, note } = token(`ease-${name}`)
        return (
          <li key={name} className="group flex flex-col overflow-hidden rounded-l border border-line">
            <span className="flex flex-col gap-4 bg-surface-muted/60 p-4">
              <Curve value={value} />
              <Demo className={cn('duration-(--duration-slow)', className)} />
            </span>
            <span className="flex flex-1 flex-col gap-1 border-t border-line p-3">
              <span className="text-body-s font-medium text-ink">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
              <CopyToken name={`ease-${name}`} />
              {/* A spring's `linear()` runs to a line of numbers: its note says where it comes from instead. */}
              <Meta>{value.startsWith('linear(') ? note : value}</Meta>
              <span className="text-caption text-ink-muted">{use}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
