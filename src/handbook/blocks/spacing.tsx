import { cn } from '@/lib/utils'

import { Code, Meta } from './token-label'

/** The steps Norte uses from Tailwind's 4px scale, each class written out so Tailwind finds it. */
const STEPS = [
  { step: '0.5', className: 'w-0.5' },
  { step: '1', className: 'w-1' },
  { step: '2', className: 'w-2' },
  { step: '3', className: 'w-3' },
  { step: '4', className: 'w-4' },
  { step: '6', className: 'w-6' },
  { step: '8', className: 'w-8' },
  { step: '10', className: 'w-10' },
  { step: '12', className: 'w-12' },
  { step: '16', className: 'w-16' },
  { step: '20', className: 'w-20' },
  { step: '24', className: 'w-24' },
]

/** The spacing scale: each step's class number, its size, and a bar that long. */
export function SpacingScale() {
  return (
    <ul className="sb-unstyled my-6 divide-y divide-line border-y border-line">
      {STEPS.map(({ step, className }) => (
        <li key={step} className="flex items-center gap-4 py-2">
          <span className="w-16 shrink-0">
            <Code>{step}</Code>
          </span>
          <span className="w-36 shrink-0">
            <Meta>
              {Number(step) * 4}px · {Number(step) / 4}rem
            </Meta>
          </span>
          <span className={cn('h-4 rounded-s bg-accent', className)} />
        </li>
      ))}
    </ul>
  )
}
