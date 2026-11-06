import { tv } from '@/lib/utils'

import { type LINK_VARIANTS } from './link.const'

/**
 * A link's look. The two variants mark the link differently because they wrap differently. A standalone link is short
 * and sits on one line, so its underline is a pseudo-element that only scales, and stays on the compositor: it draws in
 * from the left on hover and, as its origin flips, carries on out to the right when the pointer leaves instead of
 * rewinding. An inline link can wrap onto several lines, where a pseudo-element can't follow (it spans from the first
 * line's start to the last one's end, not each row), so it keeps a real underline that follows every row, and its hover
 * is a color change: the line goes from a soft tint to solid and the text darkens a step.
 */
export const link = tv({
  slots: {
    root: [
      'group/link cursor-pointer rounded-s text-accent-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    label: '',
    // The arrow of a link that opens a new tab steps toward where it leads.
    icon: [
      'ml-0.5 inline-block size-3 align-baseline',
      'transition-transform duration-(--duration-base) ease-standard',
      'group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5',
    ],
  },
  variants: {
    variant: {
      // Its color sets it apart from the words around it, but color alone can't mark a link (WCAG 1.4.1): the line
      // stays under it, and hovering makes both stronger.
      inline: {
        root: 'transition-colors duration-(--duration-base) ease-standard hover:text-accent-hover',
        label: [
          'underline decoration-accent-ink/40 decoration-2 underline-offset-4',
          'transition-[text-decoration-color] duration-(--duration-base) ease-standard group-hover/link:decoration-current',
        ],
      },
      // Its place (a menu, a list) already marks it as a link, so a resting line would be noise: it draws in on hover.
      standalone: {
        root: 'inline-flex items-center font-medium',
        label: [
          'relative inline-block',
          'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-right after:scale-x-0 after:bg-current',
          'after:transition-transform after:duration-(--duration-slower) after:ease-enter',
          'group-hover/link:after:origin-left group-hover/link:after:scale-x-100',
        ],
      },
    } satisfies Record<(typeof LINK_VARIANTS)[number], object>,
  },
  defaultVariants: { variant: 'inline' },
})
