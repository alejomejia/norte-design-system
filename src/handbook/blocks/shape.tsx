import { token } from '@/handbook/tokens'
import { cn } from '@/lib/utils'

import { Code, describe, Meta } from './token-label'

const RADII = [
  { name: 's', className: 'rounded-s' },
  { name: 'm', className: 'rounded-m' },
  { name: 'l', className: 'rounded-l' },
  { name: 'xl', className: 'rounded-xl' },
]

const SHADOWS = [
  { className: 'shadow-s', use: 'Tooltips, small floating labels' },
  { className: 'shadow-m', use: 'Menus and popovers' },
  { className: 'shadow-l', use: 'Dialogs' },
]

/** The radii, each on a square, with what it's for. */
export function Radii() {
  return (
    <ul className="sb-unstyled my-6 grid grid-cols-2 gap-6 md:grid-cols-4">
      {RADII.map(({ name, className }) => {
        const { value, note } = token(`radius-${name}`)
        return (
          <li key={name} className="flex flex-col gap-3">
            <span className={cn('size-24 border border-line-strong bg-surface-muted', className)} />
            <span className="flex flex-col gap-0.5">
              <Code>{className}</Code>
              <Meta>
                {Number.parseFloat(value) * 16}px{note && ` · ${describe(note)}`}
              </Meta>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** The shadows, each on a card floating over a quiet surface. Only what floats above the page gets one. */
export function Shadows() {
  return (
    <ul className="sb-unstyled my-6 grid gap-6 rounded-l bg-surface-muted p-8 md:grid-cols-3">
      {SHADOWS.map(({ className, use }) => (
        <li
          key={className}
          className={cn('flex h-28 flex-col justify-end gap-0.5 rounded-l bg-surface p-4', className)}
        >
          <Code>{className}</Code>
          <Meta>{use}</Meta>
        </li>
      ))}
    </ul>
  )
}
