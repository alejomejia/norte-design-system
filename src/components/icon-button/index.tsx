'use client'

import { Button, type ButtonProps } from '@/components/button'
import { Icon, type IconName } from '@/components/icon'

import { iconButton } from './icon-button.styles'

export type IconButtonProps = Omit<ButtonProps, 'children' | 'hover'> & {
  /** The icon, by its name in Norte's set. */
  icon: IconName
  /**
   * What the button does, in words: its accessible name, since the icon says nothing to a screen reader. Required. A
   * tooltip that shows it is on the way.
   */
  label: string
}

/**
 * A button with an icon and no visible label, for actions that repeat in toolbars, rows and cards (copy, edit, more).
 * The same variants, sizes and states as `Button`, in a square. `ghost` by default: icon buttons are rarely the main
 * action.
 *
 * @example
 * <IconButton icon="copy" label="Copy the run's output" onClick={copyOutput} />
 */
export function IconButton({ icon, label, variant = 'ghost', size = 'm', className, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      hover="fade"
      aria-label={label}
      className={iconButton({ size, ghost: variant === 'ghost', className })}
    >
      <Icon name={icon} />
    </Button>
  )
}
