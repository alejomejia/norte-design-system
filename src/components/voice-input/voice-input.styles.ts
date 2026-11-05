import { tv } from '@/lib/utils'

import { type VOICE_INPUT_SIDES } from './voice-input.const'

/*
 * The mic button, and the recording pill that grows out of it to one side. The pill is always there at full width,
 * clipped down to the mic's circle; recording opens the clip (`clip-path`, no layout), so it can overlap the toolbar
 * instead of pushing it. Open, the clip reaches past the pill so its shadow shows. Closed, it's `inert` (no pointer, no
 * focus), so the mic under it stays clickable; it isn't `visibility: hidden`, which would keep the stop button from
 * taking focus the moment it opens.
 *
 * Opening, the pill covers the mic at once and stretches out with `ease-enter`, while its contents glide in from the
 * mic. Closing is shorter: the contents fade first, the pill shrinks back over the mic, and only then fades out. The
 * stop button sits where the mic was, so the mic seems to turn into it. Its bars are scaled every frame by
 * `useLevelBars`.
 */
export const voiceInputStyles = tv({
  slots: {
    root: 'relative inline-flex size-10 shrink-0',
    mic: 'rounded-full',
    pill: [
      'group absolute top-0 opacity-0',
      'transition-opacity delay-(--duration-fast) duration-(--duration-fast) ease-standard',
      'data-recording:opacity-100 data-recording:delay-0',
    ],
    surface: [
      'flex h-10 w-40 items-center gap-3 rounded-full border border-line bg-surface shadow-m',
      'transition-[clip-path] duration-(--duration-base) ease-standard',
      'group-data-recording:duration-(--duration-slow) group-data-recording:ease-enter',
      'group-data-recording:[clip-path:inset(-1rem_round_2.25rem)]',
    ],
    stop: [
      'grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-inverse text-on-inverse',
      'transition-transform duration-(--duration-spring) ease-spring active:scale-90',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    // Filled, the way a stop button is drawn everywhere. It grows into place as the mic gives way to it.
    stopIcon: [
      'size-3 scale-50 fill-current transition-transform duration-(--duration-fast) ease-standard',
      'group-data-recording:scale-100 group-data-recording:duration-(--duration-slow) group-data-recording:ease-enter',
    ],
    // The bars and the timer, at both ends of the room past the stop button. They glide in from the mic's side.
    content: [
      'flex flex-1 items-center justify-between gap-3',
      'opacity-0 transition-[opacity,translate] duration-(--duration-fast) ease-standard',
      'group-data-recording:translate-x-0 group-data-recording:opacity-100',
      'group-data-recording:duration-(--duration-slow) group-data-recording:ease-enter',
    ],
    bars: 'flex h-6 items-center gap-1',
    bar: 'h-full w-1 origin-center scale-y-20 rounded-full bg-ink',
    timer: 'flex items-center gap-2 font-mono text-caption whitespace-nowrap text-ink-muted tabular-nums',
    // The only red in the control, so it reads as "recording", not as an error.
    dot: 'size-2 shrink-0 rounded-full bg-danger group-data-recording:animate-glimmer motion-reduce:animate-none',
  },
  variants: {
    side: {
      right: {
        pill: 'left-0',
        surface: 'pr-4 pl-1 [clip-path:inset(0_calc(100%-2.5rem)_0_0_round_1.25rem)]',
        content: '-translate-x-2',
      },
      // Reversed, so the stop button still sits over the mic, now at the right end.
      left: {
        pill: 'right-0',
        surface: 'flex-row-reverse pr-1 pl-4 [clip-path:inset(0_0_0_calc(100%-2.5rem)_round_1.25rem)]',
        content: 'translate-x-2 flex-row-reverse',
      },
    } satisfies Record<(typeof VOICE_INPUT_SIDES)[number], object>,
  },
  defaultVariants: { side: 'right' },
})
