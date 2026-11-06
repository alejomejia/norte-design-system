import { tv } from '@/lib/utils'

/**
 * An agent's reasoning: a header that says it's thinking, with a light crossing its label and a live clock, and the
 * steps under it, on a trace line. New steps fade in from just above (`starting:`, no JavaScript). When it's done, the
 * header becomes one line with the time it took, and the steps fold away behind it.
 */
export const reasoningStyles = tv({
  slots: {
    root: 'flex flex-col gap-3 text-body-s',
    trigger: [
      'group inline-flex w-fit cursor-pointer items-center gap-2 rounded-s text-ink-muted select-none',
      'transition-colors duration-(--duration-fast) hover:text-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    icon: 'text-ink-subtle',
    label: '',
    timer: 'font-mono text-caption text-ink-subtle tabular-nums',
    chevron:
      '-rotate-90 text-ink-subtle transition-transform duration-(--duration-base) ease-standard group-data-panel-open:rotate-0',
    panel:
      'transition-opacity duration-(--duration-base) ease-standard data-ending-style:opacity-0 data-starting-style:opacity-0',
    steps: 'ml-2 flex flex-col gap-2 border-l border-line pl-4',
    step: 'text-ink-muted transition-[opacity,translate] duration-(--duration-appear) ease-enter starting:-translate-y-1 starting:opacity-0',
  },
  variants: {
    thinking: {
      true: {
        icon: 'text-accent-ink',
        label:
          'animate-shimmer bg-linear-to-r from-ink-subtle via-ink to-ink-subtle bg-size-[200%_100%] bg-clip-text text-transparent motion-reduce:animate-none',
        // The newest step is the one being worked on.
        step: 'last:text-ink',
      },
    },
  },
})
