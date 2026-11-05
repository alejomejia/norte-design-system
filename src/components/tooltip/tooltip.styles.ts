import { tv } from '@/lib/utils'

/**
 * A tooltip: a small dark label that grows out of its trigger (from `--transform-origin`) and fades. When tooltips are
 * warm, the next one appears at once (`data-instant`), with no animation to wait for.
 */
export const tooltipStyles = tv({
  slots: {
    popup: [
      'flex items-center gap-2 rounded-s bg-inverse px-2 py-1 text-caption font-medium text-on-inverse shadow-m',
      'origin-(--transform-origin) transition-[opacity,scale] duration-(--duration-fast) ease-standard',
      'data-ending-style:opacity-0 data-instant:duration-0 data-starting-style:scale-95 data-starting-style:opacity-0',
    ],
    // A key cap on the dark surface: the light cap, turned to the tooltip's colors.
    shortcut: 'border-on-inverse/20 bg-on-inverse/10 text-on-inverse/80',
  },
})
