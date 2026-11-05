import { tv } from '@/lib/utils'

/**
 * A tooltip: a small dark label that slides 4px out from its trigger as it fades in, so it seems to come from the
 * control it describes, on whichever side it opens (`data-side`). It leaves faster than it came, with a fade only. When
 * tooltips are warm, the next one appears at once (`data-instant`), with no animation to wait for.
 */
export const tooltipStyles = tv({
  slots: {
    popup: [
      'flex items-center gap-2 rounded-s bg-inverse px-2 py-1 text-caption font-medium text-on-inverse shadow-m',
      'transition-[opacity,translate] duration-(--duration-slow) ease-enter',
      'data-starting-style:opacity-0',
      'data-starting-style:data-[side=bottom]:-translate-y-1 data-starting-style:data-[side=top]:translate-y-1',
      'data-starting-style:data-[side=left]:translate-x-1 data-starting-style:data-[side=right]:-translate-x-1',
      'data-ending-style:opacity-0 data-ending-style:duration-(--duration-fast) data-ending-style:ease-exit',
      'data-instant:duration-0',
    ],
    // A key cap on the dark surface: the light cap, turned to the tooltip's colors.
    shortcut: 'border-on-inverse/20 bg-on-inverse/10 text-on-inverse/80',
  },
})
