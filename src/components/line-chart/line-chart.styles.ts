import { tv } from '@/lib/utils'

/** What glides from point to point: only its `translate`, so it never lays the page out again. */
const glide = 'absolute top-0 left-0 transition-[translate] duration-(--duration-fast) ease-standard'

/**
 * A line chart, quiet so the line is what's read: hairline grid rows in `line`, labels in `ink-subtle` with no axis
 * lines, a 2px accent line over a soft accent fill that fades toward the bottom (idea from Tremor's area chart). On
 * mount the line draws in from the left as its fill fades in (`appear`, through `@starting-style`, so it only plays
 * when the chart first shows). When the data changes, the line, its fill and the ticks glide from their old places to
 * their new ones (`useUpdateGlide`, `slow`): a live chart scrolls by a step, an axis that grows makes room.
 *
 * Pointing at the plot, or walking it with the keyboard, shows the nearest point: a hairline crosshair, an 8px dot with
 * a ring of the surface, and a small dark readout pinned to the plot's top beside it, on the side with more room. The
 * three glide together from point to point (`fast`, `translate` only), and fade in and out as a layer. Under reduced
 * motion the durations drop to zero, so everything just appears.
 */
export const lineChartStyles = tv({
  slots: {
    root: 'relative h-48',
    svg: 'absolute inset-0 overflow-visible',
    // The plot inside it, a viewport of its own: the labels sit outside it, in the margins.
    viewport: 'overflow-visible',
    grid: 'stroke-line',
    tick: 'fill-ink-subtle text-caption tabular-nums',
    gradient: 'text-accent',
    area: 'transition-opacity duration-(--duration-appear) ease-enter starting:opacity-0',
    line: 'fill-none stroke-accent stroke-2',
    // Scaled from its left edge (its own box, not the SVG's), from nothing to the plot's width.
    reveal:
      'origin-left transition-transform duration-(--duration-appear) ease-enter transform-fill starting:scale-x-0',
    // At the insets of `LINE_CHART_MARGIN`: change both together.
    plot: [
      'absolute top-2 right-2 bottom-6 left-10 cursor-crosshair touch-pan-y rounded-s',
      'outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus',
    ],
    // The crosshair, the dot and the readout: fades in as it mounts, out as it hides.
    pointer: [
      'pointer-events-none absolute inset-0',
      'transition-opacity duration-(--duration-fast) ease-enter starting:opacity-0',
      'data-hidden:opacity-0 data-hidden:ease-exit',
    ],
    // Each `…Glide` box moves to the point (`--x`, `--y`, in px); what's inside centers itself on it.
    crosshairGlide: [glide, 'h-full translate-x-(--x)'],
    crosshair: 'h-full w-px -translate-x-1/2 bg-line-strong',
    dotGlide: [glide, 'translate-x-(--x) translate-y-(--y)'],
    dot: 'size-2 -translate-1/2 rounded-full bg-accent ring-2 ring-surface',
    tooltipGlide: [glide, 'translate-x-(--x)'],
    tooltip: [
      'absolute top-0 left-3 flex w-max flex-col rounded-s bg-inverse px-2 py-1 text-caption text-on-inverse shadow-m',
      'data-[side=left]:right-3 data-[side=left]:left-auto',
    ],
    tooltipLabel: 'text-on-inverse/70',
    tooltipValue: 'flex items-center gap-2 font-medium tabular-nums',
    // The series' key: a short stroke of the line's color, not a box.
    tooltipKey: 'h-0.5 w-3 rounded-full bg-accent',
  },
})
