import { cn } from '@/lib/utils'

import { CopyToken } from './copy-token'
import { Meta } from './token-label'
import { TokenCell, TokenRow, TokenTable } from './token-table'

/** The steps Norte uses from Tailwind's 4px scale, each bar's class written out so Tailwind finds it. */
const STEPS = [
  { step: 0.5, className: 'w-0.5', use: 'Hairline gaps: a badge inside a tag' },
  { step: 1, className: 'w-1', use: 'An icon next to its label' },
  { step: 2, className: 'w-2', use: 'Inside small controls, between related items' },
  { step: 3, className: 'w-3', use: 'Inside inputs and buttons, around their label' },
  { step: 4, className: 'w-4', use: 'Inside cards and menus' },
  { step: 6, className: 'w-6', use: 'Between groups of controls' },
  { step: 8, className: 'w-8', use: 'Inside panels and dialogs' },
  { step: 10, className: 'w-10', use: 'Between blocks of a page' },
  { step: 12, className: 'w-12', use: 'Between sections' },
  { step: 16, className: 'w-16', use: 'Around a page' },
  { step: 20, className: 'w-20', use: 'Large page sections' },
  { step: 24, className: 'w-24', use: 'Hero spacing' },
]

/**
 * The spacing scale. Tailwind has one spacing variable, `--spacing` (4px), and every step is a multiple of it, so a
 * step copies as `calc(var(--spacing) * 4)`: it keeps following the theme like any other token.
 */
export function SpacingScale() {
  return (
    <TokenTable
      columns={[
        { name: 'Token', className: 'w-44' },
        { name: 'Value', className: 'w-36' },
        { name: 'Class', className: 'w-36' },
        { name: 'Size', className: 'w-32' },
        { name: 'Use' },
      ]}
    >
      {STEPS.map(({ step, className, use }) => (
        <TokenRow key={step}>
          <TokenCell>
            <CopyToken name="spacing" label={`--spacing × ${step}`} value={`calc(var(--spacing) * ${step})`} />
          </TokenCell>
          <TokenCell>
            <Meta>
              {step * 4}px · {step / 4}rem
            </Meta>
          </TokenCell>
          <TokenCell>
            <Meta>{`p-${step} · gap-${step}`}</Meta>
          </TokenCell>
          <TokenCell>
            <span className={cn('h-4 rounded-s bg-accent', className)} />
          </TokenCell>
          <TokenCell>
            <span className="text-caption text-ink-muted">{use}</span>
          </TokenCell>
        </TokenRow>
      ))}
    </TokenTable>
  )
}
