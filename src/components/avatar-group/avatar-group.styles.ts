import { type AvatarSize } from '@/components/avatar'
import { tv } from '@/lib/utils'

/**
 * A row of avatars that overlap a little (2px at `s`, 4px at `m`, 8px at `l`), never enough to hide a letter of the
 * initials, each cut from the one before by a ring in the surface color. The hovered one rises a little and comes to
 * the front, so its tooltip reads as its own. The "+N" is a circle like the rest, in the quiet fill and faint inner
 * edge of initials.
 */
export const avatarGroup = tv({
  slots: {
    root: 'isolate flex items-center',
    item: [
      'relative rounded-full ring-2 ring-surface',
      'transition-transform duration-(--duration-fast) ease-standard hover:z-10 hover:-translate-y-0.5',
    ],
    more: [
      'relative grid shrink-0 cursor-default place-items-center rounded-full bg-surface-muted font-medium text-ink-muted ring-2 inset-ring ring-surface inset-ring-ink/10',
      'transition-transform duration-(--duration-fast) ease-standard hover:z-10 hover:-translate-y-0.5',
      'focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
  },
  variants: {
    size: {
      s: { item: 'not-first:-ml-0.5', more: 'size-6 text-caption-s not-first:-ml-0.5' },
      m: { item: 'not-first:-ml-1', more: 'size-8 text-caption not-first:-ml-1' },
      l: { item: 'not-first:-ml-2', more: 'size-10 text-body-s not-first:-ml-2' },
    } satisfies Record<AvatarSize, object>,
  },
  defaultVariants: { size: 'm' },
})
