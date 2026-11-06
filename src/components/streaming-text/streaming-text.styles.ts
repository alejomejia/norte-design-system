import { tv } from '@/lib/utils'

import { type STREAMING_TEXT_REVEALS } from './streaming-text.const'

/**
 * Text an agent writes, in the font size around it: paragraphs 12px apart, lists with muted markers. While it streams,
 * each new word comes in through `starting:` (no JavaScript): it rises 4px as it fades in over `slow` (the default),
 * fades in, clears a 4px blur, or arrives in accent ink and dries to the text's color over `appear`. An accent caret after the last word breathes,
 * paused off-screen and still under reduced motion. When the stream ends the caret fades out, and the words merge back
 * into plain text.
 */
export const streamingTextStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-3 text-pretty',
    paragraph: '',
    list: 'flex flex-col gap-1 pl-6 marker:text-ink-muted',
    item: 'pl-1',
    strong: 'font-semibold',
    word: 'starting:opacity-0',
    // As tall as the line, scaled to its middle three quarters to stand about as tall as the letters, 2px past the last.
    caret: 'inline-flex h-lh scale-y-75 ps-0.5 align-top transition-opacity duration-(--duration-base) ease-standard',
    caretBar:
      'w-0.5 animate-breathe rounded-full bg-accent in-data-paused:[animation-play-state:paused] motion-reduce:animate-none',
  },
  variants: {
    reveal: {
      fade: { word: 'transition-opacity duration-(--duration-slow) ease-enter' },
      // A filter on each new word only while it fades in: cheap enough at a word's size.
      blur: { word: 'transition-[opacity,filter] duration-(--duration-slow) ease-enter starting:blur-xs' },
      // Inline boxes can't move, so a word becomes an inline block; it still wraps between words, never inside one.
      rise: {
        word: 'inline-block transition-[opacity,translate] duration-(--duration-slow) ease-enter starting:translate-y-1',
      },
      // Color isn't a compositor property, but a few words at a time is nothing to repaint.
      ink: { word: 'transition-[opacity,color] duration-(--duration-appear) ease-enter starting:text-accent-ink' },
    } satisfies Record<(typeof STREAMING_TEXT_REVEALS)[number], object>,
    ordered: {
      true: { list: 'list-decimal' },
      false: { list: 'list-disc' },
    },
    writing: {
      false: { caret: 'opacity-0' },
    },
  },
  defaultVariants: { reveal: 'rise' },
})
