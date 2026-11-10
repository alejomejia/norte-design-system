import { tv } from '@/lib/utils'

import { type BAR_CHART_LABEL_FONTS } from './bar-chart.const'

/** What glides when the data changes, unless the chart is being resized: then it redraws in place. */
const update = 'duration-(--duration-slow) ease-standard group-data-resizing/plot:transition-none'

/**
 * A horizontal bar chart, as quiet as Line chart beside it: labels in `ink-muted` in a column of their own, 16px accent
 * bars in 32px rows (square on the baseline, 4px round at the end), hairline grid columns in `line` and the value
 * axis's labels in `ink-subtle`, with no axis lines. On mount the bars slide out from behind the baseline together
 * (`appear`, through `@starting-style`). When the data changes, each bar glides to its new length, rows glide to their
 * new places when the order changes, and the ticks glide as the axis grows, new ones fading in (`slow`): every bar is a
 * full-length rect moved with `translate` and clipped at the baseline, so its rounded end never squashes. A resize
 * redraws in place.
 *
 * Pointing at a row, or walking the rows with the keyboard, dims the other bars (`fast`), turns the row's label `ink`,
 * and shows Line chart's dark readout beside the bar's end, on the side with more room (over the labels too), its
 * label wrapping to fit there. It glides from row to row (`fast`, `translate` only) and fades in and out as a layer. Under reduced motion the durations drop to zero.
 */
export const barChartStyles = tv({
  slots: {
    // 8px above the rows, for the readout of the first one; 24px under them for the axis; 8px on the right for half
    // the last tick's label.
    root: 'relative flex flex-col pt-2 pr-2 pb-6',
    // The rows, the slider the pointer and the keyboard read: the whole row, label included, is its hit area.
    rows: [
      'relative flex h-(--height) touch-pan-y gap-2 rounded-s',
      'outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus',
    ],
    // As wide as the longest label, 40% at most. The labels share one cell and sit at their rows with `translate`, so
    // they glide when the order changes.
    labels: 'grid max-w-2/5 shrink-0',
    label: [
      'col-start-1 row-start-1 flex h-8 min-w-0 translate-y-(--y) items-center justify-end',
      'transition-[translate,opacity] starting:opacity-0',
      update,
    ],
    labelText: [
      'truncate text-caption text-ink-muted',
      'transition-colors duration-(--duration-fast) ease-standard data-active:text-ink',
    ],
    plot: 'relative min-w-0 flex-1',
    svg: 'group/plot absolute inset-0 overflow-visible',
    tick: ['translate-x-(--x) transition-[translate,opacity] starting:opacity-0', update],
    grid: 'stroke-line',
    tickLabel: 'fill-ink-subtle text-caption tabular-nums',
    row: ['translate-y-(--y) transition-[translate]', update],
    dim: 'transition-opacity duration-(--duration-fast) ease-standard data-dimmed:opacity-40',
    // Out from behind the baseline, its own width (`fill-box`), as the chart first shows.
    reveal: 'transition-[translate] duration-(--duration-appear) ease-enter transform-fill starting:-translate-x-full',
    bar: ['translate-x-(--x) fill-accent transition-[translate]', update],
    // The readout: fades in as it mounts, out as it hides.
    pointer: [
      'pointer-events-none absolute inset-0',
      'transition-opacity duration-(--duration-fast) ease-enter starting:opacity-0',
      'data-hidden:opacity-0 data-hidden:ease-exit',
    ],
    // Moves to the bar's end and its row's middle (`--x`, `--y`, in px); the readout beside it centers itself there.
    tooltipGlide: [
      'absolute top-0 left-0 translate-x-(--x) translate-y-(--y)',
      'transition-[translate] duration-(--duration-fast) ease-standard',
    ],
    tooltip: [
      'absolute top-0 left-2 flex w-max max-w-(--room) -translate-y-1/2 flex-col rounded-s bg-inverse px-2 py-1 text-caption',
      'text-on-inverse shadow-m data-[side=left]:right-2 data-[side=left]:left-auto',
    ],
    tooltipLabel: 'text-on-inverse/70',
    tooltipValue: 'flex items-center gap-2 font-medium tabular-nums',
    // The series' key: a little bar of the bars' color, square at its start like them.
    tooltipKey: 'h-2 w-3 rounded-e-s bg-accent',
    // The loading placeholder: the same rows, a label and a bar each, over the same space for the axis.
    skeleton: 'flex flex-col',
    skeletonRow: 'flex h-8 items-center gap-2',
    skeletonLabel: 'flex w-20 shrink-0 justify-end',
    skeletonLabelBox: 'h-2 rounded-s',
    skeletonPlot: 'min-w-0 flex-1',
    skeletonBar: 'h-4 rounded-none rounded-e-s',
  },
  variants: {
    labelFont: {
      sans: {},
      mono: { labelText: 'font-mono', tooltipLabel: 'font-mono' },
    } satisfies Record<(typeof BAR_CHART_LABEL_FONTS)[number], object>,
  },
})
