import { twMerge } from 'tailwind-merge'

import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from '@/motion'
import { cn, domainOf, formatCompact, formatElapsed, initials, toCSSVars } from '@/utils'

import { Code, Meta } from './token-label'
import { TokenCell, TokenRow, TokenTable } from './token-table'

/** Class lists where Norte's names meet: what a plain tailwind-merge keeps, and what `cn` keeps. */
const MERGES = [
  ['text-body-s', 'text-ink'],
  ['text-caption', 'text-ink-muted', 'text-body'],
  ['ease-standard', 'ease-spring'],
]

/** Each formatter on a few inputs, run when the page renders, so the results are always the code's own. */
const FORMATS = [
  { call: 'formatCompact(13_400)', result: formatCompact(13_400) },
  { call: 'formatCompact(1_250_000)', result: formatCompact(1_250_000) },
  { call: 'formatElapsed(4_200)', result: formatElapsed(4_200) },
  { call: 'formatElapsed(64_000)', result: formatElapsed(64_000) },
  { call: 'formatElapsed(64_200, { precise: true })', result: formatElapsed(64_200, { precise: true }) },
  { call: "initials('Sofía Herrera')", result: initials('Sofía Herrera') },
  {
    call: "domainOf('https://www.brightloop.example/pricing')",
    result: domainOf('https://www.brightloop.example/pricing'),
  },
  { call: "domainOf('/runs/128')", result: domainOf('/runs/128') },
]

/** A value as code prints it: strings quoted, objects as JSON, `undefined` spelled out. */
function printed(value: unknown): string {
  if (value === undefined) return 'undefined'
  return typeof value === 'string' ? `'${value}'` : JSON.stringify(value)
}

/** What a plain tailwind-merge and Norte's `cn` keep from the same classes, computed live. */
export function MergeExamples() {
  return (
    <TokenTable
      columns={[
        { name: 'Classes', className: 'w-2/5' },
        { name: 'tailwind-merge', className: 'w-3/10' },
        { name: 'cn', className: 'w-3/10' },
      ]}
    >
      {MERGES.map((classes) => (
        <TokenRow key={classes.join(' ')}>
          <TokenCell>
            <Code>{classes.map((name) => `'${name}'`).join(', ')}</Code>
          </TokenCell>
          <TokenCell>
            <Meta>{printed(twMerge(...classes))}</Meta>
          </TokenCell>
          <TokenCell>
            <Code>{printed(cn(...classes))}</Code>
          </TokenCell>
        </TokenRow>
      ))}
    </TokenTable>
  )
}

/** `toCSSVars` on one call: numbers become rem, strings pass through. */
export function CssVarsExample() {
  return (
    <TokenTable columns={[{ name: 'Call', className: 'w-1/2' }, { name: 'Result' }]}>
      <TokenRow>
        <TokenCell>
          <Code>{"toCSSVars({ gap: 16, swatch: 'var(--color-blue-600)' })"}</Code>
        </TokenCell>
        <TokenCell>
          <Code>{printed(toCSSVars({ gap: 16, swatch: 'var(--color-blue-600)' }))}</Code>
        </TokenCell>
      </TokenRow>
    </TokenTable>
  )
}

/** Every formatter on a few inputs, and what it returns. */
export function FormatExamples() {
  return (
    <TokenTable columns={[{ name: 'Call', className: 'w-3/5' }, { name: 'Result' }]}>
      {FORMATS.map(({ call, result }) => (
        <TokenRow key={call}>
          <TokenCell>
            <Code>{call}</Code>
          </TokenCell>
          <TokenCell>
            <Code>{printed(result)}</Code>
          </TokenCell>
        </TokenRow>
      ))}
    </TokenTable>
  )
}

/** The motion timings as Motion reads them, next to the CSS token each one mirrors. */
export function MotionTimings() {
  const rows = [
    ...Object.entries(MOTION_DURATION).map(([name, value]) => ({
      name: `MOTION_DURATION.${name}`,
      value: `${value}`,
      token: `--duration-${name}`,
    })),
    ...Object.entries(MOTION_EASE).map(([name, value]) => ({
      name: `MOTION_EASE.${name}`,
      value: `[${value.join(', ')}]`,
      token: `--ease-${name}`,
    })),
    { name: 'MOTION_SPRING', value: printed(MOTION_SPRING), token: '--ease-spring' },
  ]

  return (
    <TokenTable
      columns={[
        { name: 'Constant', className: 'w-1/3' },
        { name: 'Value', className: 'w-5/12' },
        { name: 'CSS token' },
      ]}
    >
      {rows.map(({ name, value, token }) => (
        <TokenRow key={name}>
          <TokenCell>
            <Code>{name}</Code>
          </TokenCell>
          <TokenCell>
            <Meta>{value}</Meta>
          </TokenCell>
          <TokenCell>
            <Meta>{token}</Meta>
          </TokenCell>
        </TokenRow>
      ))}
    </TokenTable>
  )
}
