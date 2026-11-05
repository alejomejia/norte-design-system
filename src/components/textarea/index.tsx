'use client'

import { Field as BaseField } from '@base-ui/react/field'
import { type ClipboardEvent, type ComponentProps, type KeyboardEvent, useState } from 'react'

import { Field, type FieldProps } from '@/components/field'
import { toCSSVars } from '@/lib/utils'

import {
  TEXTAREA_COUNT_WARNING,
  TEXTAREA_LABELS,
  TEXTAREA_MAX_ROWS,
  TEXTAREA_MIN_ROWS,
  type TEXTAREA_VARIANTS,
} from './textarea.const'
import { textareaStyles } from './textarea.styles'

export type TextareaProps = Omit<
  ComponentProps<'textarea'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'className' | 'rows'
> &
  Omit<FieldProps, 'aside' | 'children' | 'className'> & {
    /** The text, when the app controls it. */
    value?: string
    defaultValue?: string
    /** Called with the new text as the person types. */
    onValueChange?: (value: string) => void
    /** How many lines it shows when empty. */
    minRows?: number
    /** How many lines it grows to before it scrolls. */
    maxRows?: number
    /** With `maxLength`: a count at the end of the description's row, red at the limit, told to screen readers near it. */
    showCount?: boolean
    /** `outline` in forms; `ghost`, with no box and reading-size text, inside a surface that draws its own (a prompt). */
    variant?: (typeof TEXTAREA_VARIANTS)[number]
    /** The textarea's words: what screen readers hear near the limit. */
    labels?: typeof TEXTAREA_LABELS
    className?: string
  }

/**
 * Several lines of text with a label, a description and an error, like an agent's standing instructions. It grows with
 * its text up to `maxRows`, then scrolls, and can count characters against `maxLength`. The same field as Text field,
 * built on Base UI's Field, which ties the label, the description and the error to it and runs the browser's checks.
 *
 * @example
 * <Textarea label="Instructions" maxLength={2000} showCount />
 */
export function Textarea({
  value,
  defaultValue = '',
  onValueChange,
  label,
  description,
  error,
  minRows = TEXTAREA_MIN_ROWS,
  maxRows = TEXTAREA_MAX_ROWS,
  showCount = false,
  variant = 'outline',
  labels = TEXTAREA_LABELS,
  name,
  disabled,
  validate,
  validationMode,
  validationDebounceTime,
  invalid,
  className,
  ...props
}: TextareaProps) {
  const [ownValue, setOwnValue] = useState(defaultValue)
  const text = value ?? ownValue
  const { maxLength, onKeyDown, onPaste } = props
  // Each keystroke refused at the limit restarts the count's nudge, so typing past it doesn't just do nothing.
  const [refusals, setRefusals] = useState(0)

  function change(next: string) {
    if (value === undefined) setOwnValue(next)
    onValueChange?.(next)
  }

  /** Whether the browser will refuse new text: the field is full and nothing is selected to replace. */
  function isFull({ value: current, selectionStart, selectionEnd }: HTMLTextAreaElement) {
    return maxLength !== undefined && current.length >= maxLength && selectionStart === selectionEnd
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event)
    // A character key (one character long, no shortcut held) that would type, not one that composes a word.
    const types = event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.nativeEvent.isComposing
    if (types && isFull(event.currentTarget)) setRefusals((count) => count + 1)
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    onPaste?.(event)
    if (isFull(event.currentTarget)) setRefusals((count) => count + 1)
  }

  const remaining = maxLength === undefined ? undefined : maxLength - text.length
  const styles = textareaStyles({ variant, atLimit: remaining !== undefined && remaining <= 0 })

  const count =
    showCount && maxLength !== undefined && remaining !== undefined ? (
      <>
        {/* A new key remounts it, so each refusal plays the nudge again. */}
        <span key={refusals} className={styles.count({ nudge: refusals > 0 })}>
          {text.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
        {/* Quiet until the limit is near, so a screen reader isn't told the count on every keystroke. */}
        <span role="status" className="sr-only">
          {remaining <= TEXTAREA_COUNT_WARNING ? labels.remaining(Math.max(remaining, 0)) : ''}
        </span>
      </>
    ) : undefined

  return (
    <Field
      label={label}
      description={description}
      error={error}
      aside={count}
      name={name}
      disabled={disabled}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
      invalid={invalid}
      className={className}
    >
      <BaseField.Control
        value={text}
        onValueChange={change}
        className={styles.textarea()}
        style={toCSSVars({ 'min-rows': String(minRows), 'max-rows': String(maxRows) })}
        // Base UI has no textarea part: its control renders one, and keeps the label, description and checks.
        render={<textarea rows={minRows} {...props} onKeyDown={handleKeyDown} onPaste={handlePaste} />}
      />
    </Field>
  )
}
