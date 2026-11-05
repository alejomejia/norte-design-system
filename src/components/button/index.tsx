'use client'

import { Button as BaseButton } from '@base-ui/react/button'
import { type ReactNode, useState } from 'react'

import { type BUTTON_HOVERS, type BUTTON_SIZES, BUTTON_SUCCESS_DURATION, type BUTTON_VARIANTS } from './button.const'
import { useSuccessFeedback } from './button.hooks'
import { button, buttonContent } from './button.styles'
import { ButtonFeedback } from './button-feedback'

export type ButtonProps = Omit<BaseButton.Props, 'className' | 'children' | 'disabled'> & {
  /**
   * Its look: `primary` for the main action of a screen (one per view), `secondary` beside it, `ghost` for quiet actions
   * in toolbars and lists, and `danger` for what can't be undone.
   */
  variant?: (typeof BUTTON_VARIANTS)[number]
  /** Its height: `s` (32px) in toolbars and dense rows, `m` (40px) everywhere else. */
  size?: (typeof BUTTON_SIZES)[number]
  /**
   * How the fill arrives on hover: `wipe` sweeps it across, to draw the eye to an action; `fade` brings it in quietly,
   * for buttons that sit in a row, where a sweep on each would be too much. Icon buttons always fade.
   */
  hover?: (typeof BUTTON_HOVERS)[number]
  /**
   * While its action runs: shows a spinner in place of the label, keeps the button's width and ignores clicks. It stays
   * focusable, so focus isn't lost, and announces itself as busy.
   */
  loading?: boolean
  /**
   * When its action succeeds: turn it on as `loading` turns off, and the spinner becomes a check for a moment, then the
   * label comes back. It shows once per success and clears when the next action starts, so there's nothing to reset.
   */
  success?: boolean
  /** What screen readers hear when the check shows. */
  successLabel?: string
  /** Ignores clicks and dims the button. Prefer explaining why an action isn't available over disabling it. */
  disabled?: boolean
  /**
   * Keeps a disabled button hoverable and in the tab order (`aria-disabled` in place of the native `disabled`), while
   * it still ignores clicks. Set it when a tooltip explains the button: a natively disabled button gets no hover or
   * focus, so its tooltip could never open. A busy button does it on its own.
   */
  focusableWhenDisabled?: boolean
  /** The label, with an icon before or after it if it needs one. */
  children: ReactNode
  className?: string
}

/**
 * Starts an action. A native `<button>`, `type="button"` by default so it never submits a form by accident: set
 * `type="submit"` for the one that should.
 *
 * @example
 * <Button loading={status === 'running'} success={status === 'done'} onClick={startRun}>
 *   Run agent
 * </Button>
 */
export function Button({
  variant = 'primary',
  size = 'm',
  hover = 'wipe',
  loading = false,
  success,
  successLabel = 'Done',
  disabled = false,
  focusableWhenDisabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const succeeded = useSuccessFeedback(Boolean(success) && !loading, BUTTON_SUCCESS_DURATION)
  const busy = loading || succeeded
  const state = loading ? 'loading' : succeeded ? 'success' : undefined

  // The feedback (and Motion with it) mounts the first time the button is busy, not with every button on the page, then
  // stays so its spinner and check can animate out. A button that renders busy shows its spinner without animating in.
  const [busyAtMount] = useState(busy)
  const [hasBeenBusy, setHasBeenBusy] = useState(busy)
  if (busy && !hasBeenBusy) setHasBeenBusy(true)

  return (
    <>
      <BaseButton
        type="button"
        {...props}
        disabled={disabled || busy}
        focusableWhenDisabled={busy || focusableWhenDisabled}
        aria-busy={loading || undefined}
        className={button({ variant, size, hover, busy, loading, className })}
      >
        {hasBeenBusy && <ButtonFeedback state={state} animateIn={!busyAtMount} />}
        <span className={buttonContent({ busy })}>{children}</span>
      </BaseButton>
      {/* Only for buttons that report a success: a live region next to the button, not inside it, where it would
       * become part of the button's name. */}
      {success !== undefined && (
        <span role="status" className="sr-only">
          {succeeded ? successLabel : ''}
        </span>
      )}
    </>
  )
}
