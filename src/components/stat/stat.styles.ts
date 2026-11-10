import { tv } from '@/lib/utils'

import { type STAT_COLUMNS, type STAT_SIZES, type STAT_VARIANTS } from './stat.const'

/**
 * A stat: a muted caption, the value large and in tabular figures (so a number that changes doesn't shift its row), and
 * the change in a caption under it. Only the change carries a color, and only when it's good or bad news; the
 * comparison after it stays muted. No motion of its own: stats sit still in a panel, and the help popover and the
 * loading skeleton bring theirs.
 *
 * The help button is trimmed from a small icon button's 32px to 24px, so its hover fill stays in scale with a 16px
 * caption (and still meets WCAG's 24px target size). It overhangs the row (`-my-1`) rather than making the row taller,
 * 4px after the label so the fill doesn't touch the text. When the change line doesn't fit, the comparison moves
 * under it whole, instead of breaking mid-phrase; the arrow and its amount never part.
 *
 * Loading, the value and the change are two bars sized to the text's look, 8px apart (line-height boxes would leave
 * them 15px apart). Padding around them adds up to the loaded height, so nothing moves when the numbers arrive: the
 * value's line (28px at `s`, 32px at `m`), plus the change's 4px gap and 16px line when there's one.
 */
export const statStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-1',
    label: 'flex min-h-4 items-center gap-1 text-caption text-ink-muted',
    help: '-my-1 h-6 w-6 rounded-s',
    value: 'truncate font-semibold text-ink tabular-nums',
    change: 'flex flex-wrap items-center gap-x-1 text-caption font-medium tabular-nums',
    delta: 'inline-flex items-center gap-1 whitespace-nowrap',
    arrow: 'size-3 shrink-0',
    comparison: 'font-normal text-ink-muted',
    loading: 'flex flex-col gap-2',
    valueBar: 'h-4 w-20 rounded-s',
    changeBar: 'h-2 w-32 rounded-s',
  },
  variants: {
    variant: {
      plain: {},
      muted: { root: 'rounded-l bg-surface-muted p-3' },
    } satisfies Record<(typeof STAT_VARIANTS)[number], object>,
    size: {
      s: { value: 'text-heading-s', loading: 'pt-1' },
      m: { value: 'text-heading-m', loading: 'pt-2' },
    } satisfies Record<(typeof STAT_SIZES)[number], object>,
    tone: {
      success: { change: 'text-success' },
      danger: { change: 'text-danger' },
      neutral: { change: 'text-ink-muted' },
    },
    /** Whether a change line is there (or loading): the loading bars' padding makes up its height. */
    changeLine: {
      true: { loading: 'pb-3' },
      false: { loading: 'pb-2' },
    },
  },
  defaultVariants: { variant: 'plain', size: 's', tone: 'neutral', changeLine: false },
})

/** A group of stats: a grid, with room between plain stats and a tighter gap between tiles. */
export const statGroupStyles = tv({
  base: 'grid',
  variants: {
    variant: {
      plain: 'gap-x-6 gap-y-4',
      muted: 'gap-3',
    } satisfies Record<(typeof STAT_VARIANTS)[number], string>,
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
    } satisfies Record<(typeof STAT_COLUMNS)[number], string>,
  },
  defaultVariants: { variant: 'plain', columns: 2 },
})
