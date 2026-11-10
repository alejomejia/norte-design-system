/** The fonts a bar's label can take: `mono` for names that are code, like a tool's. */
export const BAR_CHART_LABEL_FONTS = ['sans', 'mono'] as const

/**
 * A row's height and its bar's thickness, in px: a 16px bar in the middle of a 32px row, which is also the row's hit
 * area. The rows' `h-8` and the bar's place in `bar-chart.styles.ts` follow them: change both together.
 */
export const BAR_CHART_ROW = { height: 32, bar: 16 } as const

/** The radius at a bar's end, in px: its start is square, on the baseline. */
export const BAR_CHART_RADIUS = 4

/**
 * The gap between a bar's end and its readout, in px: the readout's `left-2` / `right-2` in `bar-chart.styles.ts`
 * follows it. Change both together.
 */
export const BAR_CHART_TOOLTIP_GAP = 8

/** The gap between the plot and the value axis's labels under it, in px. */
export const BAR_CHART_TICK_GAP = 8

/** About how far apart the value axis's labels sit, in px: the number of ticks follows the space there is. */
export const BAR_CHART_TICK_SPACING = 56

/**
 * How wide the value axis's labels are taken to be, so they never touch: about 7.5px a character of `caption` text,
 * with 16px between two. An estimate, so the ticks are known before anything is drawn.
 */
export const BAR_CHART_LABEL_FIT = { charWidth: 7.5, gap: 16 } as const

/** How many rows the loading placeholder draws when it has no data to count. */
export const BAR_CHART_LOADING_ROWS = 5

/** The loading placeholder's rows, in turn: a label's width, and its bar's share of the plot, longest first. */
export const BAR_CHART_LOADING_SHAPES = [
  { label: 'w-16', bar: 'w-4/5' },
  { label: 'w-20', bar: 'w-3/5' },
  { label: 'w-14', bar: 'w-2/5' },
  { label: 'w-16', bar: 'w-1/4' },
  { label: 'w-12', bar: 'w-1/6' },
] as const

/** What screen readers hear while the data loads. */
export const BAR_CHART_LOADING_LABEL = 'Loading chart'
