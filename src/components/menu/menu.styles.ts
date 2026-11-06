import { tv } from '@/lib/utils'

import { type MENU_ITEM_TONES } from './menu.const'

/*
 * A menu: a popup that grows out of its trigger (from `--transform-origin`) and fades out, like Select's list. Its
 * highlight glides from row to row the same way: the highlighted row names itself an anchor and one shape behind the
 * rows follows it (CSS anchor positioning, scoped to each popup so a submenu keeps its own). On a danger row it turns
 * red. Rows keep one column for icons and indicators: once a popup holds one (`data-menu-icon`), rows without one indent
 * to match, so every label lines up. Browsers without anchor positioning tint the highlighted row instead.
 */
export const menuStyles = tv({
  slots: {
    positioner: 'z-50 outline-none',
    popup: [
      'group/popup relative isolate max-h-(--available-height) min-w-56 overflow-y-auto [anchor-scope:all]',
      'origin-(--transform-origin) rounded-l border border-line bg-surface p-1 shadow-m outline-none',
      'transition-[opacity,scale] duration-(--duration-fast) ease-standard',
      'data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
    ],
    item: [
      'flex h-8 cursor-pointer items-center gap-2 rounded-s px-2 text-body-s text-ink outline-none select-none',
      'group-has-data-menu-icon/popup:not-has-data-menu-icon:pl-8',
      'data-highlighted:[anchor-name:--nt-menu-highlight] data-popup-open:[anchor-name:--nt-menu-highlight]',
      'not-supports-[anchor-name:--nt]:data-highlighted:bg-surface-muted',
      'data-disabled:cursor-not-allowed data-disabled:text-ink-subtle',
    ],
    icon: 'grid size-4 shrink-0 place-items-center text-ink-muted',
    label: 'min-w-0 flex-1 truncate',
    shortcut: 'ml-auto shrink-0 pl-4 text-ink-subtle',
    chevron: 'ml-auto flex shrink-0 text-ink-subtle',
    indicator: [
      'flex text-accent-ink',
      'transition-[opacity,scale] duration-(--duration-fast) ease-standard data-starting-style:scale-50 data-starting-style:opacity-0',
    ],
    dot: 'size-2 rounded-full bg-current',
    groupLabel:
      'flex h-6 items-center px-2 text-caption font-medium text-ink-subtle group-has-data-menu-icon/popup:pl-8',
    separator: '-mx-1 my-1 h-px bg-line',
    highlight: [
      'pointer-events-none absolute inset-x-1 -z-10 rounded-s bg-surface-muted opacity-0',
      'group-has-data-highlighted/popup:opacity-100 group-has-data-popup-open/popup:opacity-100',
      'group-has-[[data-highlighted][data-tone=danger]]/popup:bg-danger-subtle',
      'top-[anchor(--nt-menu-highlight_top,0)] h-[anchor-size(--nt-menu-highlight_height,0)]',
      'transition-[top,height,opacity,background-color] duration-(--duration-base) ease-standard',
      'not-supports-[anchor-name:--nt]:hidden',
    ],
  },
  variants: {
    tone: {
      default: {},
      danger: {
        item: 'text-danger not-supports-[anchor-name:--nt]:data-highlighted:bg-danger-subtle',
        icon: 'text-danger',
      },
    } satisfies Record<(typeof MENU_ITEM_TONES)[number], object>,
  },
  defaultVariants: { tone: 'default' },
})
