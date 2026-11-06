import { tv } from '@/lib/utils'

import { type MESSAGE_KINDS, type MESSAGE_THINKING_EFFECTS } from './message.const'

/**
 * A message. The avatar on the left, beside a header line (the name in ink, the time muted), with the content and its
 * actions under it. While an agent thinks or writes, its avatar moves and a word ("Thinking", "Writing") takes the
 * time's place: it breathes (or shimmers), and while thinking a clock in tenths follows it. A person's words sit on a quiet tint that hugs them; an agent's content stays open, since it holds
 * cards, plans and tool calls that would nest a surface in a surface. The actions rest hidden and fade in over a hover
 * or focus anywhere in the message, and stay shown on touch screens, where nothing hovers. With `appear`, a new message
 * fades in and rises 8px on `appear`. A copy's check pops in from half its size. Under reduced motion, it all shows at
 * once.
 */
export const messageStyles = tv({
  slots: {
    root: 'group/message flex gap-3 text-body-s text-ink',
    avatar: 'shrink-0',
    body: 'flex min-w-0 flex-1 flex-col gap-1',
    // As tall as the avatar, so the name lines up with its middle; the time sits on the name's baseline.
    header: 'flex min-h-8 flex-wrap content-center items-baseline gap-x-2',
    author: 'font-medium',
    time: 'text-caption text-ink-muted tabular-nums',
    status: 'flex items-baseline gap-2 text-caption',
    statusLabel: '',
    statusTimer: 'font-mono text-ink-subtle tabular-nums',
    content: 'flex min-w-0 flex-col gap-3 text-pretty',
    actions: [
      'flex items-center gap-1 opacity-0 transition-opacity duration-(--duration-fast) ease-standard',
      'group-focus-within/message:opacity-100 group-hover/message:opacity-100 group-data-actions-visible/message:opacity-100 pointer-coarse:opacity-100',
    ],
  },
  variants: {
    kind: {
      person: { content: 'self-start rounded-l bg-surface-muted px-3 py-2' },
      agent: {},
    } satisfies Record<(typeof MESSAGE_KINDS)[number], object>,
    thinkingEffect: {
      // Dims and brightens, paused off-screen and still under reduced motion: something is happening, calmly.
      breathe: {
        statusLabel:
          'animate-breathe text-ink-muted in-data-paused:[animation-play-state:paused] motion-reduce:animate-none',
      },
      // Reasoning's shimmer: a light that crosses the word.
      shimmer: { statusLabel: 'shimmer-text' },
      none: { statusLabel: 'text-ink-muted' },
    } satisfies Record<(typeof MESSAGE_THINKING_EFFECTS)[number], object>,
    appear: {
      true: {
        root: 'transition-[opacity,translate] duration-(--duration-appear) ease-enter starting:translate-y-2 starting:opacity-0',
      },
    },
  },
  defaultVariants: { kind: 'person', appear: false, thinkingEffect: 'breathe' },
})

/**
 * The copy action's icon, once it has changed: each icon pops in as it replaces the other (a new icon is a new element,
 * so `starting:` runs). Not on the first render, so a message's copy icon doesn't pop as the message appears.
 */
export const messageCopyStyles = tv({
  variants: {
    changed: {
      true: '[&_svg]:transition-[opacity,scale] [&_svg]:duration-(--duration-fast) [&_svg]:ease-enter [&_svg]:starting:scale-50 [&_svg]:starting:opacity-0',
    },
  },
})
