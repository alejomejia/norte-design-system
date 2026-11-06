import { tv } from '@/lib/utils'

import { type ACCORDION_VARIANTS } from './accordion.const'

/*
 * Accordion: sections stacked with hairlines between them, each a heading row that opens the content under it. One
 * state language, no fills: a closed row is quiet (muted label, subtle icon and chevron); hovering one, or opening it,
 * brings it up to full ink. On hover the chevron also nudges 2px the way it points. Open, the chevron turns down
 * (pointing to the end while closed, like Reasoning's fold) and the content rises 4px into place as it fades in.
 *
 * The nudge is a `transform`, which applies inside the chevron's own rotation: "2px down" in its frame is toward the
 * end while closed (either writing direction) and down while open, with one rule.
 *
 * The panel's height moves, an exception to transforms and opacity only: without it, everything under the section
 * jumps as it opens. Base UI measures the content and hands it over as `--accordion-panel-height`; the panel grows
 * from 0 to it and shrinks back over `duration-slow`, in step with the chevron. Height drives layout, so this stays on
 * one panel at a time and on short content, never a long list. The padding sits on an inner box: on the panel, it
 * would keep a closed panel from reaching 0. The content leaves faster than it comes, so a closing panel never shows
 * text sliding under its edge.
 */
export const accordionStyles = tv({
  slots: {
    root: 'flex flex-col divide-y divide-line text-body-s text-ink',
    item: 'group/item',
    header: '',
    trigger: [
      'group flex min-h-12 w-full cursor-pointer items-center gap-2 py-2 text-start select-none',
      'focus-visible:outline-2 focus-visible:outline-focus',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    icon: [
      'shrink-0 text-ink-subtle transition-colors duration-(--duration-base) ease-standard',
      'group-enabled:group-hover:text-ink-muted group-data-panel-open:text-ink-muted',
    ],
    text: 'flex min-w-0 flex-1 flex-col gap-0.5',
    label: [
      'font-medium text-ink-muted transition-colors duration-(--duration-base) ease-standard',
      'group-enabled:group-hover:text-ink group-data-panel-open:text-ink',
    ],
    description: 'text-caption text-ink-subtle',
    chevron: [
      'shrink-0 -rotate-90 text-ink-subtle group-data-panel-open:rotate-0 rtl:rotate-90',
      'transition-[rotate,transform,color] duration-(--duration-slow) ease-standard',
      // A bracket: Tailwind's translate utilities set `translate`, which applies outside the rotation.
      'group-enabled:group-hover:[transform:translateY(0.125rem)] group-enabled:group-hover:text-ink',
    ],
    panel: [
      'group/panel h-(--accordion-panel-height) overflow-hidden',
      'transition-[height] duration-(--duration-slow) ease-standard data-ending-style:h-0 data-starting-style:h-0',
    ],
    // The padding, on a box of its own that never moves.
    inset: [
      'pb-4',
      // Under the label, not the icon, when the trigger has one: the icon's 16px and the 8px gap.
      'group-has-data-icon/item:ps-6',
    ],
    /*
     * What rises into place, inside the padding: Base UI measures the panel's scroll height, which counts a moved box,
     * so moved on the padded box itself it would measure 4px taller, and the panel would snap back at the end.
     */
    content: [
      'text-ink-muted',
      'transition-[opacity,translate] duration-(--duration-slow) ease-enter',
      'group-data-starting-style/panel:translate-y-1 group-data-starting-style/panel:opacity-0',
      'group-data-ending-style/panel:opacity-0 group-data-ending-style/panel:duration-(--duration-fast)',
    ],
  },
  variants: {
    variant: {
      // Flush with the hairlines' ends; the focus ring sits just outside the row.
      line: { trigger: 'rounded-s focus-visible:outline-offset-2' },
      // Inset: the surface clips what's drawn outside its rows.
      outline: {
        root: 'overflow-hidden rounded-l border border-line bg-surface',
        trigger: 'px-4 focus-visible:-outline-offset-2',
        inset: 'px-4 group-has-data-icon/item:ps-10',
      },
    } satisfies Record<(typeof ACCORDION_VARIANTS)[number], object>,
  },
  defaultVariants: { variant: 'line' },
})
