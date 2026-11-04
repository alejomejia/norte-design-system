import { token } from '@/handbook/tokens'
import { cn } from '@/lib/utils'

import { CopyToken } from './copy-token'
import { describe, Meta } from './token-label'

const RADII = [
  { name: 's', className: 'rounded-s' },
  { name: 'm', className: 'rounded-m' },
  { name: 'l', className: 'rounded-l' },
  { name: 'xl', className: 'rounded-xl' },
]

const SHADOWS = [
  { name: 's', className: 'shadow-s', use: 'Tooltips and small floating labels' },
  { name: 'm', className: 'shadow-m', use: 'Menus and popovers' },
  { name: 'l', className: 'shadow-l', use: 'Dialogs' },
]

/** The radii as cards: a corner drawn large in the radius, then its name and size, its token and what it's for. */
export function Radii() {
  return (
    <ul className="sb-unstyled my-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {RADII.map(({ name, className }) => {
        const { value, note } = token(`radius-${name}`)
        return (
          <li key={name} className="flex flex-col overflow-hidden rounded-l border border-line">
            <span className="flex h-28 overflow-hidden bg-surface-muted/60 pt-6 pl-6">
              {/* A square larger than the card, so only its top-left corner shows, at its real size. */}
              <span className={cn('size-48 shrink-0 border-t border-l border-line-strong bg-surface', className)} />
            </span>
            <span className="flex flex-1 flex-col gap-1 border-t border-line p-3">
              <span className="flex items-baseline gap-2 text-body-s font-medium text-ink">
                {name.toUpperCase()}
                <Meta>{Number.parseFloat(value) * 16}px</Meta>
              </span>
              <CopyToken name={`radius-${name}`} />
              {note && <span className="text-caption text-ink-muted">{describe(note)}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** The shadows, each on a card floating over a quiet surface: its name, its token and what floats with it. */
export function Shadows() {
  return (
    <ul className="sb-unstyled my-6 grid gap-6 rounded-l bg-surface-muted p-8 md:grid-cols-3">
      {SHADOWS.map(({ name, className, use }) => (
        <li key={name} className={cn('flex h-36 flex-col justify-end gap-1 rounded-l bg-surface p-4', className)}>
          <span className="text-body-s font-medium text-ink">{name.toUpperCase()}</span>
          <CopyToken name={`shadow-${name}`} />
          <span className="text-caption text-ink-muted">{use}</span>
        </li>
      ))}
    </ul>
  )
}
