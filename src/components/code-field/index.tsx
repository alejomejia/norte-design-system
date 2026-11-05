'use client'

import { OTPField } from '@base-ui/react/otp-field'
import { Fragment, type ReactNode, useId } from 'react'

import { CODE_FIELD_LENGTH } from './code-field.const'
import { codeFieldStyles } from './code-field.styles'

export type CodeFieldProps = Omit<OTPField.Root.Props, 'length' | 'children' | 'className'> & {
  /** How many characters the code has. */
  length?: number
  /** How many characters each group has, split by a dash: `3` shows a six-character code as 3 – 3. */
  groupSize?: number
  /** The label above the slots. Without one, give the field an `aria-label`. */
  label?: ReactNode
  className?: string
}

/**
 * A one-time code, one slot per character, like the code that confirms a sign-in. Typing moves to the next slot, paste
 * fills them all, and phones offer the code from a text message. Each character settles into its slot as it arrives.
 * Built on Base UI's OTP Field. Idea from React Bits' Code Slots.
 *
 * @example
 * <CodeField label="Verification code" onValueComplete={verify} />
 */
export function CodeField({
  length = CODE_FIELD_LENGTH,
  groupSize = 3,
  label,
  id,
  className,
  ...props
}: CodeFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const styles = codeFieldStyles()

  return (
    <div className={styles.root({ className })}>
      {label && (
        <label htmlFor={inputId} className={styles.label()}>
          {label}
        </label>
      )}
      <OTPField.Root id={inputId} length={length} className={styles.slots()} {...props}>
        {Array.from({ length }, (_, index) => (
          <Fragment key={index}>
            {index > 0 && index % groupSize === 0 && <span aria-hidden="true" className={styles.separator()} />}
            {/* Each slot's position comes from its order: Base UI counts them. */}
            <OTPField.Input className={styles.slot()} />
          </Fragment>
        ))}
      </OTPField.Root>
    </div>
  )
}
