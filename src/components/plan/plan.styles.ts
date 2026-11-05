import { tv } from '@/lib/utils'

/**
 * An agent's plan as a checklist. When a step is done, its box fills from the left like a checkbox, the check draws
 * itself as the fill passes, and a line strikes through the label, across every line it wraps on, as the text dims.
 * The step in progress has a dot that glows softly (paused off-screen). No overshoot anywhere: it's a record of work.
 */
export const planStyles = tv({
  slots: {
    root: 'flex flex-col gap-3 text-body-s',
    step: 'group flex items-start gap-3',
    box: [
      'relative isolate mt-0.5 grid size-4 shrink-0 place-items-center overflow-hidden rounded-s border border-line-strong text-on-accent',
      'transition-colors duration-(--duration-base) group-data-active:border-accent group-data-done:border-accent',
      'before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-accent',
      'before:transition-transform before:duration-(--duration-base) before:ease-standard group-data-done:before:scale-x-100',
    ],
    dot: [
      'col-start-1 row-start-1 size-2 rounded-full bg-accent opacity-0 group-data-active:animate-glimmer',
      'in-data-paused:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:group-data-active:opacity-100',
    ],
    check: [
      'col-start-1 row-start-1 size-3 [stroke-dasharray:1] [stroke-dashoffset:1]',
      'transition-[stroke-dashoffset] duration-(--duration-base) ease-enter group-data-done:delay-100 group-data-done:[stroke-dashoffset:0]',
    ],
    // The strike is a background line, so it grows across wrapped lines one after the other.
    label: [
      'text-ink-muted group-data-active:text-ink',
      'bg-linear-to-r from-current to-current bg-size-[0%_1px] bg-position-[0_55%] bg-no-repeat',
      'transition-[background-size,color] duration-(--duration-slow) ease-standard',
      'group-data-done:bg-size-[100%_1px] group-data-done:text-ink-subtle group-data-done:delay-150',
    ],
  },
})
