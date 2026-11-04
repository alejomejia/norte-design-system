'use client'

import { Button as BaseButton } from '@base-ui/react/button'
import { type ReactNode } from 'react'

import { type BUTTON_SIZES, type BUTTON_VARIANTS } from './button.const'
import { button, buttonContent } from './button.styles'
import { ButtonSpinner } from './button-spinner'

export type ButtonProps = Omit<BaseButton.Props, 'className' | 'children' | 'disabled'> & {
  /**
   * Its look: `primary` for the main action of a screen (one per view), `secondary` beside it, `ghost` for quiet actions
   * in toolbars and lists, and `danger` for what can't be undone.
   */
  variant?: (typeof BUTTON_VARIANTS)[number]
  /** Its height: `s` (32px) in toolbars and dense rows, `m` (40px) everywhere else. */
  size?: (typeof BUTTON_SIZES)[number]
  /**
   * While its action runs: shows a spinner in place of the label, keeps the button's width and ignores clicks. It stays
   * focusable, so focus isn't lost, and announces itself as busy.
   */
  loading?: boolean
  /** Ignores clicks and dims the button. Prefer explaining why an action isn't available over disabling it. */
  disabled?: boolean
  /** The label, with an icon before or after it if it needs one. */
  children: ReactNode
  className?: string
}

/**
 * Starts an action. A native `<button>`, `type="button"` by default so it never submits a form by accident: set
 * `type="submit"` for the one that should.
 *
 * @example
 * <Button onClick={startRun}>Run agent</Button>
 */
export function Button({
  variant = 'primary',
  size = 'm',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      type="button"
      {...props}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      className={button({ variant, size, loading, className })}
    >
      {loading && <ButtonSpinner />}
      <span className={buttonContent({ loading })}>{children}</span>
    </BaseButton>
  )
}
