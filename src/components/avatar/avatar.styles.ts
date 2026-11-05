import { tv } from '@/lib/utils'

import { type AVATAR_KINDS, type AVATAR_SIZES, type AVATAR_STATUSES } from './avatar.const'

/**
 * An avatar's look: a circle. A person shows a photo, or initials on a quiet fill; an agent shows only its colors in
 * motion, a shader on a canvas, which is what tells it apart from a person at a glance. Under the canvas, a CSS gradient
 * of the agent's colors shows before the first frame and where WebGL isn't available. A hairline
 * inside the edge keeps a light photo from melting into the page. The status dot sits on the corner, cut out of the
 * avatar by a ring in the surface color.
 */
export const avatar = tv({
  slots: {
    root: 'relative inline-flex shrink-0 align-middle select-none',
    frame: [
      'relative grid size-full place-items-center overflow-hidden rounded-full',
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-ink/10',
    ],
    image:
      'size-full object-cover transition-opacity duration-(--duration-base) ease-standard data-starting-style:opacity-0',
    initials: 'font-medium text-ink-muted',
    effect: 'absolute inset-0 size-full',
    status: 'absolute right-0 bottom-0 rounded-full bg-current ring-2 ring-surface',
  },
  variants: {
    kind: {
      person: { frame: 'bg-surface-muted' },
      agent: { frame: 'bg-linear-to-br from-(--avatar-light) via-(--avatar-mid) to-(--avatar-deep)' },
    } satisfies Record<(typeof AVATAR_KINDS)[number], object>,
    size: {
      s: { root: 'size-6', initials: 'text-caption-s', status: 'size-2' },
      m: { root: 'size-8', initials: 'text-caption', status: 'size-2' },
      l: { root: 'size-10', initials: 'text-body-s', status: 'size-3' },
    } satisfies Record<(typeof AVATAR_SIZES)[number], object>,
    status: {
      online: { status: 'text-success' },
      away: { status: 'text-warning' },
      busy: { status: 'text-danger' },
      offline: { status: 'text-ink-subtle' },
    } satisfies Record<(typeof AVATAR_STATUSES)[number], object>,
    // The dot sends out a ring, again and again, like Badge's live dot; it stays still under reduced motion.
    live: {
      true: {
        status:
          'before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-current before:opacity-75 motion-reduce:before:animate-none',
      },
    },
  },
  defaultVariants: { kind: 'person', size: 'm', live: false },
})
