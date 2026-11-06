import {
  LOGO_LABEL,
  LOGO_NEEDLE,
  type LOGO_SIZES,
  type LOGO_TONES,
  type LOGO_VARIANTS,
  LOGO_WORDMARK,
} from './logo.const'
import { logoStyles } from './logo.styles'

export type LogoProps = {
  /** `full`: the needle and the wordmark. `mark`: the needle alone, where space is short. `tile`: the needle on a tile, like an app's icon. */
  variant?: (typeof LOGO_VARIANTS)[number]
  /** The needle at Icon's sizes, `s` (16px), `m` (24px) or `l` (32px), with the wordmark (14, 18 or 24px type) to match. */
  size?: (typeof LOGO_SIZES)[number]
  /** The background it sits on: `default` for light ones, `inverse` for dark ones. A tile takes the other: dark on light. */
  tone?: (typeof LOGO_TONES)[number]
  /** Swings the needle until it settles on north, once, as it appears, like a compass. For a first screen, like sign in. */
  animated?: boolean
  /** What screen readers hear. */
  label?: string
  className?: string
}

/**
 * Norte's logo: a needle pointing north, and the wordmark. Drawn as SVG in the brand's blues, the same whatever font
 * the app loads; screen readers hear one image, "Norte".
 *
 * @example
 * <Logo />
 * <Logo variant="tile" size="l" animated />
 */
export function Logo({
  variant = 'full',
  size = 'm',
  tone = 'default',
  animated = false,
  label = LOGO_LABEL,
  className,
}: LogoProps) {
  const styles = logoStyles({ variant, size, tone, animated })
  return (
    <span role="img" aria-label={label} className={styles.root({ className })}>
      <svg viewBox={LOGO_NEEDLE.viewBox} aria-hidden="true" focusable="false" className={styles.mark()}>
        <g className={styles.needle()}>
          <path d={LOGO_NEEDLE.shade} className={styles.shade()} />
          <path d={LOGO_NEEDLE.light} className={styles.light()} />
        </g>
      </svg>
      {variant === 'full' && (
        <svg viewBox={LOGO_WORDMARK.viewBox} aria-hidden="true" focusable="false" className={styles.wordmark()}>
          <path d={LOGO_WORDMARK.path} />
        </svg>
      )}
    </span>
  )
}
