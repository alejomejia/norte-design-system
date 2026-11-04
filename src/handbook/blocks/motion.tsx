import { token } from '@/handbook/tokens'

import { Code, Meta } from './token-label'

const DURATIONS = ['fast', 'base', 'slow']

/** Each easing with its class written out, and the class that plays it on the demo dot. */
const EASINGS = [
  { name: 'standard', className: 'ease-standard' },
  { name: 'enter', className: 'ease-enter' },
  { name: 'exit', className: 'ease-exit' },
]

/** `cubic-bezier(0.2, 0, 0, 1)` → its four numbers. */
function bezierPoints(value: string): number[] {
  return (/cubic-bezier\(([^)]+)\)/.exec(value)?.[1] ?? '0, 0, 1, 1').split(',').map(Number)
}

/** The curve of an easing: time runs left to right, progress bottom to top. */
function Curve({ value }: { value: string }) {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = bezierPoints(value)
  const size = 64
  return (
    <svg viewBox={`-4 -4 ${size + 8} ${size + 8}`} className="size-20 overflow-visible" aria-hidden="true">
      <path d={`M0 ${size} H${size} M0 ${size} V0`} className="stroke-line" fill="none" />
      <path
        d={`M0 ${size} C${x1 * size} ${(1 - y1) * size} ${x2 * size} ${(1 - y2) * size} ${size} 0`}
        className="stroke-accent"
        strokeWidth={2}
        fill="none"
      />
    </svg>
  )
}

/** The durations, with what each one is for. They drop to zero under reduced motion. */
export function Durations() {
  return (
    <ul className="sb-unstyled my-6 divide-y divide-line border-y border-line">
      {DURATIONS.map((name) => {
        const { value, note } = token(`duration-${name}`)
        return (
          <li key={name} className="flex items-center gap-4 py-3">
            <span className="w-60 shrink-0">
              <Code>{`duration-(--duration-${name})`}</Code>
            </span>
            <Meta>{value}</Meta>
            <span className="text-body-s text-ink-muted">{note}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** The easings: each curve, and a dot that crosses its track with it when you hover the card. */
export function Easings() {
  return (
    <ul className="sb-unstyled my-6 grid gap-4 md:grid-cols-3">
      {EASINGS.map(({ name, className }) => {
        const { value } = token(`ease-${name}`)
        return (
          <li key={name} className="group flex flex-col gap-4 rounded-l border border-line p-6">
            <Curve value={value} />
            <span className="relative h-2 rounded-full bg-surface-muted">
              <span
                className={`${className} absolute top-0 left-0 size-2 rounded-full bg-accent transition-[left] duration-(--duration-slow) group-hover:left-[calc(100%-0.5rem)]`}
              />
            </span>
            <span className="flex flex-col gap-0.5">
              <Code>{className}</Code>
              <Meta>{value}</Meta>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
