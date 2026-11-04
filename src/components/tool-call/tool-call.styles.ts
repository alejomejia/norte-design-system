import { tv } from '@/lib/utils'

/**
 * A tool call as a chip. While it runs, a light fill creeps across it with the time (`--progress`, a scale, so it stays
 * on the compositor). When it finishes, the fill completes and takes the color of the outcome, and the tool's icon
 * turns into a check or a cross. A failure also nudges the chip once.
 */
export const toolCallStyles = tv({
  slots: {
    root: [
      'group relative isolate inline-flex h-8 max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-m border border-line bg-surface px-3 text-body-s text-ink',
      'data-error:animate-nudge motion-reduce:animate-none',
    ],
    fill: [
      'absolute inset-0 -z-10 origin-left scale-x-(--progress) bg-accent/15',
      'transition-[scale,background-color] duration-(--duration-fast) ease-linear',
      'group-not-data-running:duration-(--duration-slow) group-not-data-running:ease-standard',
      'group-data-success:scale-x-100 group-data-success:bg-success-subtle',
      'group-data-error:scale-x-100 group-data-error:bg-danger-subtle',
    ],
    icons: [
      'grid size-4 shrink-0 place-items-center *:col-start-1 *:row-start-1',
      '*:transition-[opacity,scale] *:duration-(--duration-base) *:ease-standard',
    ],
    toolIcon: 'text-ink-muted group-not-data-running:scale-50 group-not-data-running:opacity-0',
    successIcon: 'scale-50 text-success opacity-0 group-data-success:scale-100 group-data-success:opacity-100',
    errorIcon: 'scale-50 text-danger opacity-0 group-data-error:scale-100 group-data-error:opacity-100',
    name: 'shrink-0 font-mono text-caption font-medium',
    detail: 'min-w-0 truncate text-ink-muted',
    timer: 'ml-auto shrink-0 pl-1 font-mono text-caption text-ink-subtle tabular-nums',
  },
})
