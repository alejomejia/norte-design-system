'use client'

import { Field as BaseField } from '@base-ui/react/field'
import { type ReactNode, useState } from 'react'

import { Icon } from '@/components/icon'

import { fieldStyles } from './field.styles'

export type FieldProps = Pick<
  BaseField.Root.Props,
  'name' | 'disabled' | 'validate' | 'validationMode' | 'validationDebounceTime' | 'invalid'
> & {
  /** The label above the control. Without one, the control needs an `aria-label`. */
  label?: ReactNode
  /** A hint under the control, read by screen readers with it: what goes in, or what happens with it. */
  description?: ReactNode
  /**
   * What's wrong, and how to fix it. Marks the field invalid and shows under the description. Without it, the
   * browser's own message shows when a built-in check fails (`required`, `type="email"`) or `validate` returns one.
   */
  error?: ReactNode
  /** Something at the end of the description's row, like a character count. */
  aside?: ReactNode
  /** The control: a Base UI `Input` or `Field.Control`, which the label, description and error attach to. */
  children: ReactNode
  className?: string
}

/**
 * The frame of a text control: its label, the control, its description and its error, tied together for screen
 * readers by Base UI's Field. Internal: Text field and Textarea are built on it, and apps use them.
 */
export function Field({ label, description, error, aside, invalid, children, className, ...props }: FieldProps) {
  // The last error the app passed, so it can fade out with its words rather than as an empty line once it's cleared.
  const [lastError, setLastError] = useState(error)
  if (error !== undefined && error !== lastError) setLastError(error)

  const styles = fieldStyles()
  return (
    <BaseField.Root {...props} invalid={invalid ?? (error ? true : undefined)} className={styles.root({ className })}>
      {label && <BaseField.Label className={styles.label()}>{label}</BaseField.Label>}
      {children}
      {(description || aside) && (
        <div className={styles.footer()}>
          {description && <BaseField.Description className={styles.description()}>{description}</BaseField.Description>}
          {aside && <div className={styles.aside()}>{aside}</div>}
        </div>
      )}
      <BaseField.Error
        match={error ? true : undefined}
        className={styles.error()}
        render={(errorProps, state) => {
          // Base UI fills `children` with the browser's message; the app's own error wins over it.
          const message =
            error ?? (errorProps.children || (state.transitionStatus === 'ending' ? lastError : undefined))
          return (
            <div {...errorProps}>
              {message && (
                <>
                  <Icon name="error" />
                  <span>{message}</span>
                </>
              )}
            </div>
          )
        }}
      />
    </BaseField.Root>
  )
}
