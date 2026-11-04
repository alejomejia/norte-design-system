import { TOKENS, token } from '@/handbook/tokens'

import { Code, describe, Meta } from './token-label'

/** Each step of the scale, with its class written out so Tailwind finds it. */
const SCALE = [
  { name: 'display', className: 'text-display' },
  { name: 'heading-l', className: 'text-heading-l' },
  { name: 'heading-m', className: 'text-heading-m' },
  { name: 'heading-s', className: 'text-heading-s' },
  { name: 'body', className: 'text-body' },
  { name: 'body-s', className: 'text-body-s' },
  { name: 'caption', className: 'text-caption' },
]

const WEIGHTS = [
  { name: 'regular', className: 'font-regular' },
  { name: 'medium', className: 'font-medium' },
  { name: 'semibold', className: 'font-semibold' },
]

/** `0.875rem` → `14px`, at the default 16px root. */
function toPx(rem: string): string {
  return `${Number.parseFloat(rem) * 16}px`
}

/** The type scale: a sample at each size, then its size, line height and tracking. */
export function TypeScale() {
  return (
    <ul className="sb-unstyled my-6 divide-y divide-line border-y border-line">
      {SCALE.map(({ name, className }) => {
        const size = token(`text-${name}`)
        const lineHeight = token(`text-${name}--line-height`)
        // Only the large sizes tighten their tracking.
        const tracking = TOKENS.get(`text-${name}--letter-spacing`)?.value
        return (
          <li key={name} className="flex flex-col gap-2 py-4 md:flex-row md:items-baseline md:gap-8">
            <div className="flex w-40 shrink-0 flex-col gap-0.5">
              <Code>{className}</Code>
              <Meta>
                {toPx(size.value)} / {toPx(lineHeight.value)}
                {tracking && ` · ${tracking}`}
              </Meta>
              {size.note && <Meta>{describe(size.note)}</Meta>}
            </div>
            <p className={`${className} min-w-0 truncate text-ink`}>The agent finished the run</p>
          </li>
        )
      })}
    </ul>
  )
}

/** Both typefaces: Inter for the interface, JetBrains Mono for code and what agents write. */
export function FontFamilies() {
  return (
    <div className="sb-unstyled my-6 grid gap-4 md:grid-cols-2">
      <figure className="flex flex-col gap-4 rounded-l border border-line p-6">
        <p className="font-sans text-display text-ink">Aa</p>
        <figcaption className="flex flex-col gap-0.5">
          <Code>font-sans</Code>
          <span className="text-body-s text-ink-muted">Inter. The interface: labels, text, headings.</span>
        </figcaption>
      </figure>
      <figure className="flex flex-col gap-4 rounded-l border border-line p-6">
        <p className="font-mono text-display text-ink">Aa</p>
        <figcaption className="flex flex-col gap-0.5">
          <Code>font-mono</Code>
          <span className="text-body-s text-ink-muted">JetBrains Mono. Code, logs and agent output.</span>
        </figcaption>
      </figure>
    </div>
  )
}

/** The three weights. Fewer weights keep the hierarchy in size and color, not in boldness. */
export function FontWeights() {
  return (
    <ul className="sb-unstyled my-6 grid gap-4 md:grid-cols-3">
      {WEIGHTS.map(({ name, className }) => (
        <li key={name} className="flex flex-col gap-2 rounded-l border border-line p-6">
          <span className={`${className} text-heading-m text-ink`}>Run complete</span>
          <span className="flex items-baseline justify-between">
            <Code>{className}</Code>
            <Meta>{token(`font-weight-${name}`).value}</Meta>
          </span>
        </li>
      ))}
    </ul>
  )
}
