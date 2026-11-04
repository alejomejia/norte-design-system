import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Column = {
  name: string
  /** Its width, as a Tailwind `w-*`. The last column usually takes what's left. */
  className?: string
}

/**
 * A framed table of tokens, one row each: the token (a `CopyToken`), its value, a sample and what it's for. The columns
 * are the caller's: `TokenTable` draws the frame and the header, `TokenRow` a row, `TokenCell` a cell.
 */
export function TokenTable({ columns, children }: { columns: Column[]; children: ReactNode }) {
  return (
    <div className="sb-unstyled my-6 overflow-x-auto rounded-l border border-line">
      <table className="w-full min-w-160 table-fixed border-collapse text-left">
        <thead className="bg-surface-muted/60">
          <tr className="border-b border-line">
            {columns.map(({ name, className }) => (
              <th key={name} scope="col" className={cn('px-4 py-2 text-caption font-medium text-ink-muted', className)}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  )
}

/** A row of a `TokenTable`. Its cells can react to it being hovered (`group-hover:`). */
export function TokenRow({ children }: { children: ReactNode }) {
  return <tr className="group">{children}</tr>
}

/** A cell of a `TokenRow`: its content stacked, starting at the left. */
export function TokenCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <td className="px-4 py-3 align-middle">
      <div className={cn('flex min-w-0 flex-col items-start gap-1', className)}>{children}</div>
    </td>
  )
}
