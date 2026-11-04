import { TOKENS, token } from '@/handbook/tokens'
import { cn } from '@/lib/utils'

import { CopyToken } from './copy-token'
import { describe, Meta } from './token-label'
import { TokenCell, TokenRow, TokenTable } from './token-table'

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
  { name: 'regular', className: 'font-regular', use: 'Running text and most of the interface' },
  { name: 'medium', className: 'font-medium', use: 'Labels, buttons and the selected item' },
  { name: 'semibold', className: 'font-semibold', use: 'Headings, and the rare word that must stand out' },
]

const FAMILIES = {
  sans: { className: 'font-sans', name: 'Inter', designer: 'Rasmus Andersson' },
  mono: { className: 'font-mono', name: 'JetBrains Mono', designer: 'JetBrains' },
}

/** The characters a specimen shows, a row each. */
const GLYPHS = [
  ['Uppercase', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['Lowercase', 'abcdefghijklmnopqrstuvwxyz'],
  ['Numbers', '0123456789'],
  ['Symbols', '→ ✓ ✕ … · % & @ # * + = ? ! ( ) [ ] { } “ ” ‘ ’ , . : ; – —'],
]

const SAMPLE = 'The agent finished the run'

/** `0.875rem` → `14px`, at the default 16px root. */
function toPx(rem: string): string {
  return `${Number.parseFloat(rem) * 16}px`
}

/** A typeface at a glance: its letters and name set large, who drew it and its token, then its characters. */
export function TypeSpecimen({ family }: { family: keyof typeof FAMILIES }) {
  const { className, name, designer } = FAMILIES[family]

  return (
    <figure className="sb-unstyled my-6 overflow-hidden rounded-l border border-line">
      <div className="flex items-center gap-8 bg-surface-muted/60 p-8">
        <span aria-hidden="true" className={cn('text-display text-ink', className)}>
          Aa
        </span>
        <figcaption className="flex flex-col gap-1">
          <span className={cn('text-heading-m text-ink', className)}>{name}</span>
          <span className="text-body-s text-ink-muted">By {designer}</span>
          <CopyToken name={`font-${family}`} />
        </figcaption>
      </div>
      <dl className="divide-y divide-line border-t border-line px-8">
        {GLYPHS.map(([label, glyphs]) => (
          <div key={label} className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-8">
            <dt className="w-24 shrink-0 text-caption text-ink-subtle">{label}</dt>
            <dd className={cn('min-w-0 text-heading-s break-words text-ink', className)}>{glyphs}</dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}

/** The weights as cards: a sample in the weight, then its name and value, its token and what it's for. */
export function FontWeights() {
  return (
    <ul className="sb-unstyled my-6 grid gap-4 md:grid-cols-3">
      {WEIGHTS.map(({ name, className, use }) => (
        <li key={name} className="flex flex-col overflow-hidden rounded-l border border-line">
          <span className={cn('flex h-28 items-end bg-surface-muted/60 p-4 text-heading-l text-ink', className)}>
            Run complete
          </span>
          <span className="flex flex-1 flex-col gap-1 border-t border-line p-3">
            <span className="flex items-baseline gap-2 text-body-s font-medium text-ink">
              {name.charAt(0).toUpperCase() + name.slice(1)}
              <Meta>{token(`font-weight-${name}`).value}</Meta>
            </span>
            <CopyToken name={`font-weight-${name}`} />
            <span className="text-caption text-ink-muted">{use}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** The type scale: each size's token and class, its size, line height and tracking, and a sample. */
export function TypeScale() {
  return (
    <TokenTable
      columns={[{ name: 'Token', className: 'w-52' }, { name: 'Size', className: 'w-32' }, { name: 'Sample' }]}
    >
      {SCALE.map(({ name, className }) => {
        const size = token(`text-${name}`)
        const lineHeight = token(`text-${name}--line-height`)
        // Only the large sizes tighten their tracking.
        const tracking = TOKENS.get(`text-${name}--letter-spacing`)?.value
        return (
          <TokenRow key={name}>
            <TokenCell>
              <CopyToken name={`text-${name}`} />
              <Meta>{className}</Meta>
            </TokenCell>
            <TokenCell>
              <Meta>
                {toPx(size.value)} / {toPx(lineHeight.value)}
              </Meta>
              {tracking && <Meta>{tracking}</Meta>}
            </TokenCell>
            <TokenCell>
              <span className={cn('max-w-full truncate text-ink', className)}>{SAMPLE}</span>
              {size.note && <span className="text-caption text-ink-muted">{describe(size.note)}</span>}
            </TokenCell>
          </TokenRow>
        )
      })}
    </TokenTable>
  )
}
