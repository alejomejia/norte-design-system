'use client'

import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { type ReactNode } from 'react'

import { switchStyles } from './switch.styles'

export type SwitchProps = Omit<BaseSwitch.Root.Props, 'className' | 'children'> & {
  /** The label next to the switch. Without one, give the switch an `aria-label`. */
  children?: ReactNode
  className?: string
}

/**
 * Turns a setting on or off, right away, like letting an agent run without approval. For a choice that's only saved
 * with a form, use a checkbox. Controlled with `checked` and `onCheckedChange`, or uncontrolled with `defaultChecked`.
 *
 * @example
 * <Switch checked={autoApprove} onCheckedChange={setAutoApprove}>Approve tool calls automatically</Switch>
 */
export function Switch({ children, className, ...props }: SwitchProps) {
  const styles = switchStyles({ labelled: Boolean(children) })
  const control = (
    <BaseSwitch.Root {...props} className={styles.root({ className: children ? undefined : className })}>
      <BaseSwitch.Thumb className={styles.thumb()} />
    </BaseSwitch.Root>
  )

  if (!children) return control
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI renders the switch inside, a button with its hidden input
    <label className={styles.label({ className })}>
      {control}
      {children}
    </label>
  )
}
