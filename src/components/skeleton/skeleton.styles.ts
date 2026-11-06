import { tv } from '@/lib/utils'

import { type SKELETON_CIRCLE_SIZES, type SKELETON_TEXT_SIZES } from './skeleton.const'

/**
 * What every shape shares: a quiet fill that breathes (dims and brightens, `breathe` in `theme.css`). Shapes that mount
 * together breathe together. It pauses off-screen (the Skeleton's `data-paused`) and holds still under reduced motion.
 */
const shape =
  'animate-breathe bg-surface-strong/70 in-data-paused:[animation-play-state:paused] motion-reduce:animate-none'

/**
 * A skeleton: placeholder shapes in a group that fades in after a short wait, so a quick load never flashes it. Text
 * lines are as tall as the line height they stand for, with the bar trimmed to its middle (`clip-path`, so the box keeps
 * its height), so nothing moves when the text arrives.
 */
export const skeletonStyles = tv({
  slots: {
    root: '',
    text: 'flex flex-col',
    line: [shape, 'h-lh w-full [clip-path:inset(25%_0_round_var(--radius-s))] last:not-first:w-3/5'],
    box: [shape, 'h-24 w-full rounded-m'],
    circle: [shape, 'shrink-0 rounded-full'],
  },
  variants: {
    immediate: {
      false: { root: 'transition-opacity delay-150 duration-(--duration-appear) ease-standard starting:opacity-0' },
    },
    size: {
      s: { circle: 'size-6' },
      m: { circle: 'size-8' },
      l: { circle: 'size-10' },
    } satisfies Record<(typeof SKELETON_CIRCLE_SIZES)[number], object>,
    textSize: {
      caption: { text: 'text-caption' },
      'body-s': { text: 'text-body-s' },
      body: { text: 'text-body' },
      'heading-s': { text: 'text-heading-s' },
      'heading-m': { text: 'text-heading-m' },
    } satisfies Record<(typeof SKELETON_TEXT_SIZES)[number], object>,
  },
  defaultVariants: { immediate: false, size: 'm', textSize: 'body-s' },
})
