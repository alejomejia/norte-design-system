'use client'

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'

import {
  DialogBody,
  type DialogBodyProps,
  DialogClose,
  type DialogCloseProps,
  DialogDescription,
  type DialogDescriptionProps,
  DialogFooter,
  type DialogFooterProps,
  DialogHeader,
  type DialogHeaderProps,
  DialogPopup,
  type DialogPopupProps,
  DialogTitle,
  type DialogTitleProps,
} from './dialog-parts'

/*
 * Alert dialog's parts are Dialog's, wrapped: Base UI shares them between the two, but each Norte part carries its
 * compound's name (`AlertDialog.Title`, `Dialog.Title`) for the code panel and DevTools, so one function can't serve both.
 */

export type AlertDialogTriggerProps = BaseAlertDialog.Trigger.Props

/** What opens it: Norte's `Button`, through `render`. */
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger {...props} />
}

/** Dialog's popup, `s` by default: a question and its answers read best narrow. */
export function AlertDialogPopup({ size = 's', ...props }: DialogPopupProps) {
  return <DialogPopup size={size} {...props} />
}

/** Dialog's header: the question. */
export function AlertDialogHeader(props: DialogHeaderProps) {
  return <DialogHeader {...props} />
}

/** The question, as a heading: "Delete run #128?". Screen readers hear it as the alert's name. */
export function AlertDialogTitle(props: DialogTitleProps) {
  return <DialogTitle {...props} />
}

/** What happens if the person goes ahead, in the body. Screen readers hear it after the name. */
export function AlertDialogDescription(props: DialogDescriptionProps) {
  return <DialogDescription {...props} />
}

/** Dialog's body: the description, and anything else the question needs. */
export function AlertDialogBody(props: DialogBodyProps) {
  return <DialogBody {...props} />
}

/** The answers: Cancel first, so it gets focus, and the action last. */
export function AlertDialogFooter(props: DialogFooterProps) {
  return <DialogFooter {...props} />
}

/** A button that closes it, through `render`: the footer's Cancel. */
export function AlertDialogClose(props: DialogCloseProps) {
  return <DialogClose {...props} />
}
