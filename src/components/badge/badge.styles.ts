import { tv } from '@/lib/utils'

import { type BADGE_TONES } from './badge.const'

/**
 * A badge: a short label on a tinted fill, with an optional dot in its tone. A `live` dot sends out a ring, again and
 * again, for a state that's still changing (a run in progress); it stays still under reduced motion.
 */
export const badgeStyles = tv({
  slots: {
    root: 'inline-flex h-6 shrink-0 items-center gap-2 rounded-s px-2 text-caption font-medium whitespace-nowrap',
    dot: 'relative size-2 shrink-0 rounded-full bg-current',
  },
  variants: {
    tone: {
      neutral: { root: 'bg-surface-muted text-ink-muted' },
      accent: { root: 'bg-accent-subtle text-accent-ink' },
      success: { root: 'bg-success-subtle text-success' },
      warning: { root: 'bg-warning-subtle text-warning' },
      danger: { root: 'bg-danger-subtle text-danger' },
    } satisfies Record<(typeof BADGE_TONES)[number], object>,
    live: {
      true: {
        dot: 'before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-current before:opacity-75 motion-reduce:before:animate-none',
      },
    },
  },
  defaultVariants: { tone: 'neutral', live: false },
})
