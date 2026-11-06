'use client'

import { Popover as BasePopover } from '@base-ui/react/popover'
import { type ComponentProps, type ReactNode } from 'react'

import { IconButton } from '@/components/icon-button'

import {
  type POPOVER_ALIGNS,
  POPOVER_CLOSE_LABEL,
  POPOVER_SIDE_OFFSET,
  type POPOVER_SIDES,
  type POPOVER_WIDTHS,
} from './popover.const'
import { popoverStyles } from './popover.styles'

const styles = popoverStyles()

export type PopoverPopupProps = {
  /** Where it opens, relative to the trigger. It flips when there's no room. */
  side?: (typeof POPOVER_SIDES)[number]
  /** How it lines up with the trigger along that side. */
  align?: (typeof POPOVER_ALIGNS)[number]
  /** The gap from the trigger, in px. */
  sideOffset?: number
  /** `s` (240px), `m` (320px) or `l` (400px). It narrows to fit a small screen. */
  width?: (typeof POPOVER_WIDTHS)[number]
  /** Its content: a `Popover.Header`, then anything, and a `Popover.Close` if it needs one. */
  children: ReactNode
  className?: string
}

/** The panel itself, opened by its trigger. Focus moves into it, and back to the trigger when it closes. */
export function PopoverPopup({
  side = 'bottom',
  align = 'center',
  sideOffset = POPOVER_SIDE_OFFSET,
  width = 'm',
  children,
  className,
}: PopoverPopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className={styles.positioner()}>
        <BasePopover.Popup className={popoverStyles({ width }).popup({ className })}>{children}</BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

export type PopoverHeaderProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** `Popover.Title` and `Popover.Description`. */
  children: ReactNode
  className?: string
}

/** The top of a popover: its title and a line under it. */
export function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  return <div {...props} className={styles.header({ className })} />
}

export type PopoverTitleProps = Omit<BasePopover.Title.Props, 'className'> & { className?: string }

/** What the popover is about, as a heading. Screen readers hear it as the popover's name. */
export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return <BasePopover.Title {...props} className={styles.title({ className })} />
}

export type PopoverDescriptionProps = Omit<BasePopover.Description.Props, 'className'> & { className?: string }

/** A line under the title. Screen readers hear it after the name. */
export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <BasePopover.Description {...props} className={styles.description({ className })} />
}

export type PopoverCloseProps = {
  /** What screen readers hear. */
  label?: string
  className?: string
}

/**
 * A close button in the popover's top corner. Optional: Escape and a click outside close it too. Put it in any popover
 * whose content invites a second look, so closing it doesn't depend on knowing the keys.
 */
export function PopoverClose({ label = POPOVER_CLOSE_LABEL, className }: PopoverCloseProps) {
  return (
    <BasePopover.Close
      data-popover-close=""
      render={<IconButton icon="close" label={label} size="s" />}
      className={styles.close({ className })}
    />
  )
}
