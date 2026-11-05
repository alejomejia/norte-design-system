import { SPINNER_LABEL, type SPINNER_SIZES, SPINNER_STROKE_WIDTHS } from './spinner.const'
import { spinnerStyles } from './spinner.styles'

export type SpinnerProps = {
  /** Icon's sizes, so it can take an icon's place: `s` (16px), `m` (24px) or `l` (32px). */
  size?: (typeof SPINNER_SIZES)[number]
  /** What screen readers hear: say what's loading when you can, like "Loading results". */
  label?: string
  /**
   * Hides it from screen readers, when what's around it already says it's busy: a busy button, a loading toast.
   */
  decorative?: boolean
  className?: string
}

/**
 * Something is loading and nobody knows for how long: an arc that turns around a faint ring, in the color of its text.
 * It draws itself in as it appears: the ring traces around, and the arc grows out of it. Screen readers hear its label, "Loading" unless you name what's loading. Under reduced motion it keeps turning,
 * slowly, since a spinner that stops looks broken.
 *
 * @example
 * <Spinner label="Loading results" />
 */
export function Spinner({ size = 's', label = SPINNER_LABEL, decorative = false, className }: SpinnerProps) {
  const styles = spinnerStyles({ size })
  return (
    <span
      {...(decorative
        ? { 'aria-hidden': true }
        : // A progressbar with no value: one that can't tell how far along it is.
          { role: 'progressbar', 'aria-label': label })}
      className={styles.root({ className })}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={SPINNER_STROKE_WIDTHS[size]}
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
        className={styles.svg()}
      >
        {/* The ring is one dash as long as itself, so offsetting it hides it, and easing it back draws it. */}
        <circle cx="12" cy="12" r="9" pathLength={100} strokeDasharray={100} className={styles.track()} />
        {/* `pathLength` makes the arc's dashes a share of the ring, at any size. Its length here is the one it holds
            under reduced motion, when its animation is off. */}
        <circle cx="12" cy="12" r="9" pathLength={100} strokeDasharray="30 200" className={styles.arc()} />
      </svg>
    </span>
  )
}
