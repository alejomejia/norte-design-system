'use client'

import { Input } from '@base-ui/react/input'
import { type Ref, useMemo, useRef, useState } from 'react'

import { Field, type FieldProps } from '@/components/field'
import { Icon, type IconName } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { mergeRefs } from '@/lib/utils'

import { TEXT_FIELD_LABELS, type TEXT_FIELD_SIZES } from './text-field.const'
import { textFieldStyles } from './text-field.styles'

export type TextFieldProps = Omit<
  Input.Props,
  'className' | 'render' | 'size' | 'value' | 'defaultValue' | 'onValueChange' | 'children'
> &
  Omit<FieldProps, 'aside' | 'children' | 'className'> & {
    /** The text, when the app controls it. */
    value?: string
    defaultValue?: string
    /** Called with the new text as the person types, and with `''` when the clear button empties the field. */
    onValueChange?: (value: string) => void
    /** `s` (32px) for toolbars and filters, `m` (40px) in forms. */
    size?: (typeof TEXT_FIELD_SIZES)[number]
    /** An icon at the start of the input, by its name in Norte's set: `search` for a filter. */
    icon?: IconName
    /** A button at the end that empties the field and returns focus to it. It shows once there's text. */
    clearable?: boolean
    /** The field's words: its clear button's name. */
    labels?: typeof TEXT_FIELD_LABELS
    ref?: Ref<HTMLInputElement>
    className?: string
  }

/**
 * A single line of text with its label, a description and an error, like the email to invite someone to a run.
 * Optionally an icon at the start and a clear button at the end. Built on Base UI's Field and Input, which tie the label,
 * the description and the error to the input and run the browser's checks. An invalid field turns red and its error
 * rises into place.
 *
 * @example
 * <TextField label="Invite by email" type="email" description="They'll get a link to run #128." />
 */
export function TextField({
  value,
  defaultValue = '',
  onValueChange,
  label,
  description,
  error,
  size = 'm',
  icon,
  clearable = false,
  labels = TEXT_FIELD_LABELS,
  name,
  disabled,
  readOnly,
  validate,
  validationMode,
  validationDebounceTime,
  invalid,
  ref,
  className,
  ...props
}: TextFieldProps) {
  const [ownValue, setOwnValue] = useState(defaultValue)
  const text = value ?? ownValue
  const inputRef = useRef<HTMLInputElement>(null)
  const mergedRef = useMemo(() => mergeRefs(inputRef, ref), [ref])

  function change(next: string) {
    if (value === undefined) setOwnValue(next)
    onValueChange?.(next)
  }

  function clear() {
    change('')
    inputRef.current?.focus()
  }

  const styles = textFieldStyles({
    size,
    withIcon: Boolean(icon),
    clearable,
    filled: text.length > 0,
  })

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
      <div className={styles.control()}>
        <Input
          ref={mergedRef}
          value={text}
          onValueChange={change}
          readOnly={readOnly}
          className={styles.input()}
          {...props}
        />
        {icon && <Icon name={icon} className={styles.icon()} />}
        {clearable && !disabled && !readOnly && (
          <span className={styles.clear()}>
            <IconButton size="s" icon="close" label={labels.clear} onClick={clear} className={styles.clearButton()} />
          </span>
        )}
      </div>
    </Field>
  )
}
