'use client'

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { CHECKBOX_MARKS } from './checkbox.const'
import { checkboxStyles } from './checkbox.styles'

export type CheckboxProps = Omit<BaseCheckbox.Root.Props, 'className' | 'children'> & {
  /** The label next to the box. Without one, give the checkbox an `aria-label`. */
  children?: ReactNode
  className?: string
}

/**
 * Picks an option, or several, that a form saves later, like the tools an agent may use. For a setting that applies
 * right away, use a switch. `indeterminate` shows a mixed state, for a box that checks a group.
 *
 * @example
 * <Checkbox name="tools" value="search" defaultChecked>Web search</Checkbox>
 */
export function Checkbox({ children, className, ...props }: CheckboxProps) {
  const styles = checkboxStyles({ labelled: Boolean(children) })
  const control = (
    <BaseCheckbox.Root {...props} className={styles.root({ className: children ? undefined : className })}>
      {(['checked', 'indeterminate'] as const).map((mark) => (
        <svg
          key={mark}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            styles.mark(),
            mark === 'checked'
              ? 'group-data-checked:delay-100 group-data-checked:[stroke-dashoffset:0]'
              : 'group-data-indeterminate:delay-100 group-data-indeterminate:[stroke-dashoffset:0]',
          )}
        >
          <path d={CHECKBOX_MARKS[mark]} pathLength={1} />
        </svg>
      ))}
    </BaseCheckbox.Root>
  )

  if (!children) return control
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI renders the checkbox inside, a button with its hidden input
    <label className={styles.label({ className })}>
      {control}
      {children}
    </label>
  )
}
