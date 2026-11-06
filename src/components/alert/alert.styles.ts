import { tv } from '@/lib/utils'

import { type ALERT_TONES } from './alert.const'

/**
 * An alert: a tinted block, no border, with the tone's icon, the title in ink and the description muted, so only the
 * icon and the tint carry the tone and long copy stays easy to read. Its first line is 32px, a small button's height,
 * and the icon, the title and the close button center on it. The action shares the description's row, in the
 * bottom-right corner, its label on the baseline of its last line, so the corners mirror each other: the close
 * button 12px from the top, the action 12px from the bottom. When the description runs out of room, the action wraps
 * under it, still on the right. It rises in as it appears, the icon landing just after; dismissed, it fades, then
 * closes its height so what's below glides up.
 */
export const alertStyles = tv({
  slots: {
    // The box Motion fades and closes: its overflow clips the alert while its height shrinks.
    frame: 'overflow-hidden',
    root: 'flex items-start gap-3 rounded-l px-4 py-3 text-body-s text-ink',
    icon: 'flex h-8 shrink-0 items-center',
    main: 'flex min-w-0 flex-1 flex-col',
    header: 'flex items-start gap-3',
    // A row of its own, so the title centers on the first line while staying inline text inside.
    title: 'flex min-h-8 flex-1 items-center font-medium text-ink',
    body: 'flex flex-wrap items-baseline-last justify-end gap-x-4 gap-y-1',
    // Grows from 192px: below that, the action wraps under it rather than squeeze it.
    description: 'grow basis-48 text-ink-muted',
    action: 'shrink-0',
    close: 'shrink-0',
  },
  variants: {
    tone: {
      info: { root: 'bg-accent-subtle', icon: 'text-accent-ink' },
      success: { root: 'bg-success-subtle', icon: 'text-success' },
      warning: { root: 'bg-warning-subtle', icon: 'text-warning' },
      danger: { root: 'bg-danger-subtle', icon: 'text-danger' },
    } satisfies Record<(typeof ALERT_TONES)[number], object>,
    dismissible: {
      // The close button's ✕ then sits 16px from the edge, like the icon on the other side.
      true: { root: 'pr-2' },
    },
    // Text sits 6px inside the 32px first line; with nothing under the last line, the bottom matches it.
    endsWithText: {
      true: { root: 'pb-4' },
    },
  },
  defaultVariants: { tone: 'info', dismissible: false, endsWithText: false },
})
