'use client'

import { Toast as BaseToast } from '@base-ui/react/toast'

import { ButtonSpinner } from '@/components/button/button-spinner'
import { Icon, type IconName } from '@/components/icon'
import { IconButton } from '@/components/icon-button'

import { type TOAST_TYPES } from './toast.const'
import { TOAST_ICON_COLORS, toastStyles } from './toast.styles'

type ToastType = (typeof TOAST_TYPES)[number]

const TYPE_ICONS: Record<Exclude<ToastType, 'loading'>, IconName> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

/** One toast of the stack: its icon, title, description, action and close button. */
export function ToastItem({ toast, closeLabel }: { toast: BaseToast.Root.ToastObject; closeLabel: string }) {
  const styles = toastStyles()
  const type = toast.type as ToastType | undefined

  return (
    <BaseToast.Root toast={toast} className={styles.root()}>
      <BaseToast.Content className={styles.content()}>
        {type && (
          <span className={styles.icon({ className: TOAST_ICON_COLORS[type] })}>
            {type === 'loading' ? <ButtonSpinner /> : <Icon name={TYPE_ICONS[type]} />}
          </span>
        )}
        <div className={styles.text()}>
          <BaseToast.Title className={styles.title()} />
          <BaseToast.Description className={styles.description()} />
          {toast.actionProps && (
            <div className={styles.actions()}>
              <BaseToast.Action className={styles.action()} />
            </div>
          )}
        </div>
      </BaseToast.Content>
      <BaseToast.Close render={<IconButton icon="close" label={closeLabel} size="s" />} className={styles.close()} />
    </BaseToast.Root>
  )
}
