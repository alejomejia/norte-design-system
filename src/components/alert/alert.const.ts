import { type IconName } from '@/components/icon'
import { MOTION_DURATION } from '@/lib/motion'

/** An alert's tones: `info` for something worth knowing, then one per outcome, from good to bad. */
export const ALERT_TONES = ['info', 'success', 'warning', 'danger'] as const

/** Each tone's icon: the same set Toast uses. */
export const ALERT_ICONS = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
} as const satisfies Record<(typeof ALERT_TONES)[number], IconName>

/**
 * Each tone's live region: a warning or an error interrupts (`alert`), anything else waits for a pause (`status`).
 * Screen readers announce an alert when it appears, not when it's already on the page as it loads.
 */
export const ALERT_ROLES = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
} as const satisfies Record<(typeof ALERT_TONES)[number], 'alert' | 'status'>

/** The dismiss button's accessible name, in English by default. */
export const ALERT_DISMISS_LABEL = 'Dismiss'

/** How long the icon waits after the alert starts to appear, in seconds: it lands just after. */
export const ALERT_ICON_DELAY = 0.12

/**
 * How long a dismissed alert waits for its exit to finish before it leaves anyway, in ms: the fade and the closing
 * height, plus some slack. Motion loads lazily, and an alert dismissed before it arrives never gets its exit.
 */
export const ALERT_EXIT_TIMEOUT = (MOTION_DURATION.fast + MOTION_DURATION.slow) * 1000 + 250
