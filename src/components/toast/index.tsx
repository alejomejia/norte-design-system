'use client'

import { Toast as BaseToast } from '@base-ui/react/toast'
import { type ReactNode } from 'react'

import { TOAST_LIMIT, TOAST_TIMEOUT } from './toast.const'
import { toastStyles } from './toast.styles'
import { ToastItem } from './toast-item'

export type ToastProviderProps = {
  children: ReactNode
  /** How many toasts show at once; older ones leave as new ones come. */
  limit?: number
  /** How long a toast stays, in ms, unless it sets its own `timeout`. Hovering the stack pauses it. */
  timeout?: number
  /** The name screen readers hear for the stack. */
  label?: string
  /** The close button's name, for screen readers. */
  closeLabel?: string
}

/** The toasts on screen, read from the manager. */
function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = BaseToast.useToastManager()
  return toasts.map((toast) => <ToastItem key={toast.id} toast={toast} closeLabel={closeLabel} />)
}

/**
 * Brief messages about something that just happened, stacked in the bottom-right corner like Sonner's: each new toast
 * in front, the older ones peeking out behind, and the whole stack fanning out on hover or focus. They leave on their
 * own, swipe away, and pause while the stack is hovered. Wrap the app once, then add toasts with `useToast()`. Built on
 * Base UI's Toast, which handles the announcements and the F6 shortcut to reach them.
 *
 * @example
 * <ToastProvider><App /></ToastProvider>
 * // anywhere inside:
 * const toast = useToast()
 * toast.add({ title: 'Run finished', description: 'The shortlist is ready.', type: 'success' })
 */
export function ToastProvider({
  children,
  limit = TOAST_LIMIT,
  timeout = TOAST_TIMEOUT,
  label = 'Notifications',
  closeLabel = 'Close',
}: ToastProviderProps) {
  const styles = toastStyles()
  return (
    <BaseToast.Provider limit={limit} timeout={timeout}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport aria-label={label} className={styles.viewport()}>
          <ToastList closeLabel={closeLabel} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  )
}

/**
 * Adds, updates and closes toasts from anywhere inside `ToastProvider`: `add({ title, description, type })`, and
 * `promise(promise, { loading, success, error })` for a toast that follows an async action. `type` is `success`,
 * `error`, `warning`, `info` or `loading`.
 */
export function useToast() {
  return BaseToast.useToastManager()
}
