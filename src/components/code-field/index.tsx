'use client'

import { OTPField } from '@base-ui/react/otp-field'
import { Fragment } from 'react'

import { Field, type FieldProps } from '@/components/field'

import { CODE_FIELD_LENGTH } from './code-field.const'
import { codeFieldStyles } from './code-field.styles'

export type CodeFieldProps = Omit<OTPField.Root.Props, 'length' | 'children' | 'className' | 'name' | 'disabled'> &
  Omit<FieldProps, 'aside' | 'children' | 'className'> & {
    /** How many characters the code has. */
    length?: number
    /** How many characters each group has, split by a dash: `3` shows a six-character code as 3 – 3. */
    groupSize?: number
    className?: string
  }

/**
 * A one-time code, one slot per character, like the code that confirms a sign-in. Typing moves to the next slot, paste
 * fills them all, and phones offer the code from a text message. Each character settles into its slot as it arrives; a
 * wrong code turns the slots red, shakes them once, and its error rises in under them. Built on Base UI's Field and OTP
 * Field. Idea from React Bits' Code Slots.
 *
 * @example
 * <CodeField label="Verification code" onValueComplete={verify} error={wrong && "That code doesn't match."} />
 */
export function CodeField({
  length = CODE_FIELD_LENGTH,
  groupSize = 3,
  label,
  description,
  error,
  name,
  disabled,
  validate,
  validationMode,
  validationDebounceTime,
  invalid,
  className,
  ...props
}: CodeFieldProps) {
  const styles = codeFieldStyles()

  return (
    <Field
      label={label}
      description={description}
      error={error}
      name={name}
      disabled={disabled}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
      invalid={invalid}
      className={className}
    >
      <OTPField.Root length={length} className={styles.slots()} {...props}>
        {Array.from({ length }, (_, index) => (
          <Fragment key={index}>
            {index > 0 && index % groupSize === 0 && <span aria-hidden="true" className={styles.separator()} />}
            {/* Each slot's position comes from its order: Base UI counts them. */}
            <OTPField.Input className={styles.slot()} />
          </Fragment>
        ))}
      </OTPField.Root>
    </Field>
  )
}
