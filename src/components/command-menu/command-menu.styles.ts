import { tv } from '@/lib/utils'

import { type COMMAND_MENU_ITEM_TONES } from './command-menu.const'

/*
 * A command menu: a search field over grouped results, in a panel high on a dimmed page rather than centered, so the
 * field stays put while the results change under it. The results keep one height whatever they hold, so the hints
 * under them never jump while someone types. It arrives quicker than a dialog (a fade, a small rise and a grow on
 * `base`) because it's opened from the keyboard many times a day, and leaves on `fast`. Its highlight glides from row to
 * row like Menu's, on `fast` so holding ↓ never leaves it behind; on a danger row it turns red. The search field has no
 * ring: it's the panel's one field and always focused, and its caret says so.
 */
export const commandMenuStyles = tv({
  slots: {
    trigger: [
      'inline-flex h-8 w-56 max-w-full cursor-pointer items-center gap-2 rounded-m border border-line bg-surface ps-3 pe-1 text-body-s text-ink-subtle',
      'transition-[color,background-color] duration-(--duration-base) ease-standard hover:bg-overlay hover:text-ink-muted',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    triggerLabel: 'min-w-0 flex-1 truncate text-start',
    viewport: 'fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-32',
    popup: [
      'flex max-h-full w-144 max-w-full flex-col overflow-hidden rounded-xl bg-surface text-body-s text-ink shadow-l outline-none',
      'transition-[opacity,scale,translate] duration-(--duration-base) ease-enter',
      'data-starting-style:translate-y-2 data-starting-style:scale-98 data-starting-style:opacity-0',
      'data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:duration-(--duration-fast) data-ending-style:ease-exit',
    ],
    search: 'flex h-14 shrink-0 items-center gap-3 border-b border-line ps-4 pe-3',
    searchIcon: 'shrink-0 text-ink-subtle',
    input:
      'h-full min-w-0 flex-1 bg-transparent text-body text-ink caret-accent outline-none placeholder:text-ink-subtle',
    clear: [
      'flex transition-[opacity,scale] duration-(--duration-fast) ease-standard',
      'data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0',
    ],
    // The scroll box: the highlight sits in it, after the rows, so it scrolls with them.
    results: [
      'group/results relative isolate flex h-96 min-h-0 shrink flex-col overflow-y-auto overscroll-contain p-2 [anchor-scope:all]',
      'scroll-py-2',
    ],
    list: 'flex flex-col gap-2 empty:hidden',
    group: 'group/group flex flex-col',
    groupLabel: 'flex h-8 shrink-0 items-center px-2 text-caption font-medium text-ink-subtle',
    item: [
      'group/item flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-m px-2 text-ink outline-none select-none',
      'group-has-data-command-icon/group:not-has-data-command-icon:ps-8',
      'data-highlighted:[anchor-name:--nt-command-highlight]',
      'not-supports-[anchor-name:--nt]:data-highlighted:bg-surface-muted',
      'data-disabled:cursor-not-allowed data-disabled:text-ink-subtle',
    ],
    icon: [
      'grid size-4 shrink-0 place-items-center text-ink-muted transition-colors duration-(--duration-fast) ease-standard',
      'group-data-disabled/item:text-ink-subtle group-data-highlighted/item:text-ink',
    ],
    text: 'flex min-w-0 flex-1 items-baseline gap-2',
    label: 'min-w-0 shrink-0 truncate',
    description: 'min-w-0 truncate text-caption text-ink-subtle',
    // Fills what the list leaves; only an empty result puts anything in it.
    empty: 'flex flex-1 items-center justify-center',
    highlight: [
      'pointer-events-none absolute inset-x-2 -z-10 rounded-m bg-surface-muted opacity-0',
      'group-has-data-highlighted/results:opacity-100',
      'group-has-[[data-highlighted][data-tone=danger]]/results:bg-danger-subtle',
      'top-[anchor(--nt-command-highlight_top,0)] h-[anchor-size(--nt-command-highlight_height,0)]',
      'transition-[top,height,opacity,background-color] duration-(--duration-fast) ease-standard',
      // Hidden, it fades where it is: without a highlighted row the anchor falls back to 0, and `top` would slide there.
      // The delay keeps that slide from ever starting; the next row it glides to starts from here.
      '[transition-delay:999s,999s,0s,0s] group-has-data-highlighted/results:delay-0',
      'not-supports-[anchor-name:--nt]:hidden',
    ],
    hints:
      'flex shrink-0 items-center gap-4 border-t border-line px-4 py-2 text-caption text-ink-muted pointer-coarse:hidden',
    hint: 'flex items-center gap-2',
  },
  variants: {
    tone: {
      default: {},
      danger: {
        item: 'text-danger not-supports-[anchor-name:--nt]:data-highlighted:bg-danger-subtle',
        icon: 'text-danger group-data-highlighted/item:text-danger',
      },
    } satisfies Record<(typeof COMMAND_MENU_ITEM_TONES)[number], object>,
  },
  defaultVariants: { tone: 'default' },
})
