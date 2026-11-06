'use client'

import { Button, type ButtonProps } from '@/components/button'
import { Icon, type IconName } from '@/components/icon'

import { useSuggestions } from './suggestions.hooks'
import { suggestionsStyles } from './suggestions.styles'

export type SuggestionsItemProps = Omit<ButtonProps, 'variant' | 'size' | 'hover' | 'loading' | 'success' | 'value'> & {
  /** What goes into the prompt, when it says more than the chip: "Only EU" can ask for "Only include EU prices". */
  value?: string
  /** An icon before the words, by its name in Norte's set. */
  icon?: IconName
}

/**
 * One suggestion: a chip that hands its `value`, or its words when they're plain text, to the root's `onSelect`.
 */
export function SuggestionsItem({
  value,
  icon,
  disabled,
  children,
  className,
  onClick,
  ...props
}: SuggestionsItemProps) {
  const suggestions = useSuggestions()
  const prompt = value ?? (typeof children === 'string' ? children : '')
  return (
    <Button
      {...props}
      variant="ghost"
      size="s"
      hover="fade"
      disabled={disabled || suggestions.disabled}
      className={suggestionsStyles().chip({ className })}
      onClick={(event) => {
        onClick?.(event)
        suggestions.onSelect(prompt)
      }}
    >
      {icon && <Icon name={icon} />}
      {children}
    </Button>
  )
}
