import { tv } from '@/lib/utils'

/*
 * The mic button, and the recording pill that grows out of it to the left. The pill is always there at full width,
 * clipped down to the button's circle; recording opens the clip (`clip-path`, no layout), so it can overlap the
 * toolbar instead of pushing it. Closed, it's `inert` (no pointer, no focus), so the mic under it stays clickable;
 * it isn't `visibility: hidden`, which would keep the stop button from taking focus the moment it opens. Its bars are
 * scaled every frame by `useLevelBars`.
 */
export const voiceInputStyles = tv({
  slots: {
    root: 'relative inline-flex size-10 shrink-0',
    pill: [
      'absolute top-0 right-0 flex h-10 w-40 items-center gap-3 rounded-full border border-line bg-surface pr-4 pl-1 shadow-s',
      'opacity-0 [clip-path:inset(0_0_0_calc(100%-2.5rem)_round_1.25rem)]',
      'transition-[clip-path,opacity] duration-(--duration-slow) ease-enter',
      'data-recording:opacity-100 data-recording:[clip-path:inset(0_round_1.25rem)]',
    ],
    stop: [
      'grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-danger text-on-accent',
      'transition-transform duration-(--duration-spring) ease-spring active:scale-90',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    bars: 'flex h-5 items-center gap-1',
    bar: 'h-full w-1 origin-center scale-y-20 rounded-full bg-danger',
    timer: 'ml-auto font-mono text-caption text-ink-muted tabular-nums',
  },
})
