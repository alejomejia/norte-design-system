'use client'

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import { nameParts } from '@/lib/utils'

import {
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './dialog-alert'
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from './dialog-parts'

export type { AlertDialogTriggerProps } from './dialog-alert'
export type {
  DialogBodyProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogPopupProps,
  DialogTitleProps,
} from './dialog-parts'

export type DialogProps = BaseDialog.Root.Props

/**
 * A window over the page for a task that needs its full attention, like sharing a run: a header, a body, a footer with
 * its actions and a close button. Escape, a click outside and the close button close it. Built on Base UI's Dialog,
 * which traps focus inside it, locks the page's scroll and gives focus back when it closes.
 *
 * @example
 * <Dialog>
 *   <Dialog.Trigger render={<Button variant="secondary">Share</Button>} />
 *   <Dialog.Popup>
 *     <Dialog.Header>
 *       <Dialog.Title>Share run #128</Dialog.Title>
 *     </Dialog.Header>
 *     <Dialog.Body>…</Dialog.Body>
 *     <Dialog.Footer>…</Dialog.Footer>
 *     <Dialog.Close />
 *   </Dialog.Popup>
 * </Dialog>
 */
function DialogRoot(props: DialogProps) {
  return <BaseDialog.Root {...props} />
}

export type DialogTriggerProps = BaseDialog.Trigger.Props

/** What opens it: Norte's `Button` or `IconButton`, through `render`. */
function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger {...props} />
}

// The root's name too: its function is `DialogRoot`.
DialogRoot.displayName = 'Dialog'

export const Dialog = Object.assign(
  DialogRoot,
  nameParts('Dialog', {
    Trigger: DialogTrigger,
    Popup: DialogPopup,
    Header: DialogHeader,
    Title: DialogTitle,
    Description: DialogDescription,
    Body: DialogBody,
    Footer: DialogFooter,
    Close: DialogClose,
  }),
)

export type AlertDialogProps = BaseAlertDialog.Root.Props

/**
 * A dialog that asks before something that can't be undone, like deleting a run, and waits for an answer: a click
 * outside doesn't close it, and it has no ✕, only its footer's choices (Escape still cancels). Screen readers hear it as
 * an alert. It takes the same parts as Dialog.
 *
 * @example
 * <AlertDialog>
 *   <AlertDialog.Trigger render={<Button variant="danger">Delete run</Button>} />
 *   <AlertDialog.Popup>
 *     <AlertDialog.Header>
 *       <AlertDialog.Title>Delete run #128?</AlertDialog.Title>
 *     </AlertDialog.Header>
 *     <AlertDialog.Body>
 *       <AlertDialog.Description>This can't be undone.</AlertDialog.Description>
 *     </AlertDialog.Body>
 *     <AlertDialog.Footer>
 *       <AlertDialog.Close render={<Button variant="secondary">Cancel</Button>} />
 *       <Button variant="danger" onClick={deleteRun}>Delete run</Button>
 *     </AlertDialog.Footer>
 *   </AlertDialog.Popup>
 * </AlertDialog>
 */
function AlertDialogRoot(props: AlertDialogProps) {
  return <BaseAlertDialog.Root {...props} />
}

// The root's name too: its function is `AlertDialogRoot`.
AlertDialogRoot.displayName = 'AlertDialog'

export const AlertDialog = Object.assign(
  AlertDialogRoot,
  nameParts('AlertDialog', {
    Trigger: AlertDialogTrigger,
    Popup: AlertDialogPopup,
    Header: AlertDialogHeader,
    Title: AlertDialogTitle,
    Description: AlertDialogDescription,
    Body: AlertDialogBody,
    Footer: AlertDialogFooter,
    Close: AlertDialogClose,
  }),
)
