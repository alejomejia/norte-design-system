import { tv } from '@/lib/utils'

import { type TABS_SIZES, type TABS_VARIANTS } from './tabs.const'

/*
 * Tabs: a row of tabs and the active tab's panel under it. One indicator glides to the active tab instead of each tab
 * drawing its own: Base UI measures the tab and hands its box over as `--active-tab-*` variables. It slides with
 * `translate` and takes the new tab's width in the same transition; the width isn't a transform, but it's one small
 * absolute element that pushes nothing around, like Select's highlight. A `line` indicator is a bar over the row's
 * hairline; a `segmented` one is a raised tile behind the tab, on a muted track. A panel fades in; the one it replaces
 * leaves at once, so the two never stack.
 *
 * A row that doesn't fit scrolls sideways, its scrollbar hidden. On each side that hides tabs, a chevron sits on a
 * clear 32px strip and the tabs fade in over the next 32px, so the chevron never overlaps a tab. The fade is a mask,
 * so it works on any background: two gradient layers, one per side, each 64px wider than the row. Shifting a layer by
 * 64px slides its fade in or out of view, and `mask-position` transitions where a gradient can't. Focus scrolls a tab
 * clear of the fade (`scroll-padding`).
 */
export const tabsStyles = tv({
  slots: {
    root: 'flex flex-col gap-4',
    // The fades start hidden; a side that hides tabs shifts its layer into view.
    bar: [
      'group/bar relative [--nt-tabs-fade-end:0rem] [--nt-tabs-fade-start:-4rem]',
      'data-overflow-end:[--nt-tabs-fade-end:-4rem] data-overflow-start:[--nt-tabs-fade-start:0rem]',
    ],
    scroller: [
      // No scrollbar utility exists in Tailwind: the bracket hides it, and the row still scrolls by touch, wheel and keys.
      'scroll-px-16 [scrollbar-width:none] overflow-x-auto scroll-smooth motion-reduce:scroll-auto',
      '[mask-image:linear-gradient(to_right,transparent_2rem,black_4rem),linear-gradient(to_left,transparent_2rem,black_4rem)]',
      'mask-intersect [mask-size:calc(100%+4rem)_100%] mask-no-repeat',
      '[mask-position:var(--nt-tabs-fade-start)_0,var(--nt-tabs-fade-end)_0]',
      'transition-[mask-position] duration-(--duration-base) ease-standard',
    ],
    /*
     * On the fade, shown while its side hides tabs. Mirrored in right-to-left rows. Hidden, it's `invisible` too, not
     * just transparent: otherwise it still covers the edge tab, and contrast checkers can't tell that tab's background.
     * `visibility` flips once the fade-out ends.
     */
    scrollStart: [
      'invisible absolute inset-y-0 start-0 flex items-center opacity-0 rtl:*:rotate-180',
      'transition-[opacity,visibility] duration-(--duration-fast) group-data-overflow-start/bar:visible group-data-overflow-start/bar:opacity-100',
    ],
    scrollEnd: [
      'invisible absolute inset-y-0 end-0 flex items-center opacity-0 rtl:*:rotate-180',
      'transition-[opacity,visibility] duration-(--duration-fast) group-data-overflow-end/bar:visible group-data-overflow-end/bar:opacity-100',
    ],
    list: 'relative flex w-max',
    tab: [
      // Positioned, so they paint over the indicator, which comes first.
      'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-s text-body-s font-medium whitespace-nowrap text-ink-muted select-none',
      'transition-colors duration-(--duration-fast) not-data-disabled:hover:text-ink data-active:text-ink',
      // Inset: the scroller would clip an outline drawn outside the tab.
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    count: 'h-4 min-w-4 justify-center px-1 tabular-nums',
    /*
     * Before the tabs in the markup, and under them by that order alone: a negative `z-index` would hide it just as
     * well, but contrast checkers then can't tell that a tab sits on it.
     */
    indicator: [
      'pointer-events-none absolute left-0 w-(--active-tab-width) translate-x-(--active-tab-left)',
      'transition-[translate,width] duration-(--duration-base) ease-standard',
    ],
    panel: [
      'rounded-s focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      // The panel being replaced hides at once: Base UI keeps it mounted for a frame while it looks for an exit transition.
      'transition-opacity duration-(--duration-fast) ease-standard data-ending-style:hidden data-starting-style:opacity-0',
    ],
  },
  variants: {
    variant: {
      line: {
        /*
         * On the bar, not the list, so the hairline runs under the fades unbroken, and the indicator lies over it. An
         * inset shadow, not a border (the scroller would clip the indicator lying over one) or a pseudo-element
         * (contrast checkers can't see past one to the tabs' background).
         */
        bar: 'shadow-[inset_0_-1px_0_var(--color-line)]',
        list: 'min-w-full',
        indicator: 'bottom-0 h-0.5 rounded-full bg-ink',
      },
      segmented: {
        list: 'rounded-m bg-surface-muted p-1',
        indicator: 'top-(--active-tab-top) h-(--active-tab-height) rounded-s bg-surface shadow-s ring-1 ring-line',
      },
    } satisfies Record<(typeof TABS_VARIANTS)[number], object>,
    size: {
      s: {},
      m: {},
    } satisfies Record<(typeof TABS_SIZES)[number], object>,
    fill: {
      // The indicator is a child too, but `flex-1` does nothing to an absolute element.
      true: { list: 'min-w-full *:flex-1' },
    },
  },
  compoundVariants: [
    { variant: 'line', size: 's', class: { tab: 'h-8 px-2' } },
    { variant: 'line', size: 'm', class: { tab: 'h-10 px-3' } },
    // 4px less than the track on each side, so the track lands on 32 and 40px.
    { variant: 'segmented', size: 's', class: { tab: 'h-6 px-2' } },
    { variant: 'segmented', size: 'm', class: { tab: 'h-8 px-3' } },
  ],
  defaultVariants: { variant: 'line', size: 'm', fill: false },
})
