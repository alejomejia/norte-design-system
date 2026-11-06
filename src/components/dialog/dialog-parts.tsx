'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { type ComponentProps, type ReactNode, useMemo, useRef } from 'react'

import { IconButton } from '@/components/icon-button'
import { useOverflows } from '@/lib/hooks'
import { mergeRefs } from '@/lib/utils'

import { DIALOG_CLOSE_LABEL, type DIALOG_SIZES } from './dialog.const'
import { dialogStyles } from './dialog.styles'

const styles = dialogStyles()

export type DialogPopupProps = Omit<BaseDialog.Popup.Props, 'className' | 'children' | 'render'> & {
  /** `s` (400px) for a confirmation, `m` (512px) for a short form, `l` (640px) for more. It narrows to fit a small screen. */
  size?: (typeof DIALOG_SIZES)[number]
  /** Its content: a header, a body and a footer, and a close button if it needs one. */
  children: ReactNode
  className?: string
}

/**
 * The dialog itself, over a dimmed page. Focus moves to the first thing inside it that takes focus (or to `initialFocus`),
 * stays inside while it's open, and goes back to the trigger when it closes.
 */
export function DialogPopup({ size = 'm', children, className, ...props }: DialogPopupProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop()} />
      <BaseDialog.Viewport className={styles.viewport()}>
        <BaseDialog.Popup {...props} className={dialogStyles({ size }).popup({ className })}>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  )
}

export type DialogHeaderProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** `Dialog.Title`, and `Dialog.Description` when the body has other content. */
  children: ReactNode
  className?: string
}

/** The top of a dialog: its title and a line under it. */
export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div {...props} className={styles.header({ className })} />
}

export type DialogTitleProps = Omit<BaseDialog.Title.Props, 'className'> & { className?: string }

/** What the dialog is about, as a heading. Screen readers hear it as the dialog's name. Every dialog needs one. */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <BaseDialog.Title {...props} className={styles.title({ className })} />
}

export type DialogDescriptionProps = Omit<BaseDialog.Description.Props, 'className'> & { className?: string }

/**
 * A line under the title, in the header. When the dialog has nothing else to say, like a confirmation, put it in
 * `Dialog.Body` instead, so the body isn't left empty. Screen readers hear it after the name, wherever it sits.
 */
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <BaseDialog.Description {...props} className={styles.description({ className })} />
}

export type DialogBodyProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** The dialog's content: a form, a list, a few paragraphs. */
  children: ReactNode
  className?: string
}

/**
 * The middle of a dialog. When the content is too tall for the screen, this is the part that scrolls, and it joins the
 * tab order while it does, so the keyboard can scroll it too (with arrows, Page Up and Page Down).
 */
export function DialogBody({ className, ref, ...props }: DialogBodyProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const mergedRef = useMemo(() => mergeRefs(bodyRef, ref), [ref])
  const scrolls = useOverflows(bodyRef)

  return <div tabIndex={scrolls ? 0 : undefined} {...props} ref={mergedRef} className={styles.body({ className })} />
}

export type DialogFooterProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** Its buttons, the main action last: it sits at the end of the row, or on top when they stack on a small screen. */
  children: ReactNode
  className?: string
}

/** The bottom of a dialog: its actions, at the end of the row. */
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div {...props} className={styles.footer({ className })} />
}

export type DialogCloseProps = Omit<BaseDialog.Close.Props, 'className'> & {
  /**
   * A button that closes the dialog when pressed, like a footer's Cancel: `render={<Button variant="secondary">Cancel
   * </Button>}`. Without it, the close button is an ✕ in the dialog's top corner.
   */
  render?: BaseDialog.Close.Props['render']
  /** What screen readers hear for the ✕. */
  label?: string
  className?: string
}

/**
 * Closes the dialog: the ✕ in its top corner, or any button through `render`. Put the ✕ last in the popup: it still
 * shows in the corner, and focus starts on the content instead. A modal dialog keeps one, so touch screen readers have a
 * way out; an alert dialog doesn't, because it waits for an answer.
 */
export function DialogClose({ render, label = DIALOG_CLOSE_LABEL, className, ...props }: DialogCloseProps) {
  if (render) return <BaseDialog.Close {...props} render={render} className={className} />

  return (
    <BaseDialog.Close
      {...props}
      data-dialog-close=""
      render={<IconButton icon="close" label={label} size="s" />}
      className={styles.close({ className })}
    />
  )
}
