'use client'

import { Popover as BasePopover } from '@base-ui/react/popover'

import { nameParts } from '@/lib/utils'

import { PopoverClose, PopoverDescription, PopoverHeader, PopoverPopup, PopoverTitle } from './popover-parts'

export type {
  PopoverCloseProps,
  PopoverDescriptionProps,
  PopoverHeaderProps,
  PopoverPopupProps,
  PopoverTitleProps,
} from './popover-parts'

export type PopoverProps = BasePopover.Root.Props

/**
 * A small panel that opens from a trigger, for something worth a click but not a dialog: a breakdown, a short
 * explanation, a few settings. A title, its content and an optional close; Escape and a click outside close it too.
 * Built on Base UI's Popover, which moves focus into it and back.
 *
 * @example
 * <Popover>
 *   <Popover.Trigger render={<IconButton icon="info" label="Cost breakdown" size="s" />} />
 *   <Popover.Popup>
 *     <Popover.Header>
 *       <Popover.Title>Cost breakdown</Popover.Title>
 *     </Popover.Header>
 *     …
 *   </Popover.Popup>
 * </Popover>
 */
function PopoverRoot(props: PopoverProps) {
  return <BasePopover.Root {...props} />
}

export type PopoverTriggerProps = BasePopover.Trigger.Props

/**
 * What opens it: Norte's `Button` or `IconButton`, through `render`. `openOnHover` opens it on hover too, after `delay`,
 * for a help popover.
 */
function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger {...props} />
}

// The root's name too: its function is `PopoverRoot`.
PopoverRoot.displayName = 'Popover'

export const Popover = Object.assign(
  PopoverRoot,
  nameParts('Popover', {
    Trigger: PopoverTrigger,
    Popup: PopoverPopup,
    Header: PopoverHeader,
    Title: PopoverTitle,
    Description: PopoverDescription,
    Close: PopoverClose,
  }),
)
